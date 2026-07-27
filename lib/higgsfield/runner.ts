import { spawn } from "node:child_process";
import { HiggsfieldClient } from "@higgsfield/client";
import { createHiggsfieldClient } from "@higgsfield/client/v2";

type GenerationInput = { imagePath: string; prompt: string; generateAudio: boolean };
type RemoteGenerationInput = { image: Buffer; mimeType: string; prompt: string };

function findVideoUrl(value: unknown): string | undefined {
  if (typeof value === "string" && /^https?:\/\//.test(value) && /\.(mp4|webm)(\?|$)/i.test(value)) return value;
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findVideoUrl(item);
      if (found) return found;
    }
  }
  if (value && typeof value === "object") {
    for (const item of Object.values(value)) {
      const found = findVideoUrl(item);
      if (found) return found;
    }
  }
}

function parseCredentials() {
  const credentials = process.env.HF_CREDENTIALS?.trim();
  const separator = credentials?.indexOf(":") ?? -1;
  if (!credentials || separator < 1 || separator === credentials.length - 1) {
    throw new Error("Higgsfield credentials are missing or invalid. Add HF_CREDENTIALS as KEY_ID:KEY_SECRET.");
  }
  return { credentials, apiKey: credentials.slice(0, separator), apiSecret: credentials.slice(separator + 1) };
}

export async function generateRemoteUgcVideo(input: RemoteGenerationInput): Promise<string> {
  const { credentials, apiKey, apiSecret } = parseCredentials();
  const format = input.mimeType === "image/png" ? "png" : input.mimeType === "image/webp" ? "webp" : "jpeg";
  const uploader = new HiggsfieldClient({ apiKey, apiSecret, timeout: 120_000 });
  const imageUrl = await uploader.uploadImage(input.image, format);
  const client = createHiggsfieldClient({ credentials, timeout: 120_000, maxPollTime: 280_000, pollInterval: 3_000 });
  const creativePrompt = `${input.prompt}. Create a polished vertical creator-style product video. Keep the product, packaging, logo, colors, and label faithful to the supplied reference image. Use natural handheld movement and clear product-focused composition.`;
  const result = await client.subscribe("/v1/image2video/dop", {
    input: {
      model: "dop-turbo",
      prompt: creativePrompt,
      input_images: [{ type: "image_url", image_url: imageUrl }],
      enhance_prompt: true,
    },
    withPolling: true,
  });
  if (result.status !== "completed") {
    throw new Error(result.status === "nsfw" ? "Higgsfield rejected the image during safety review." : "Higgsfield video generation failed.");
  }
  const url = result.video?.url;
  if (!url) throw new Error("Higgsfield completed the request but returned no video URL.");
  return url;
}

export async function generateUgcVideo(input: GenerationInput): Promise<string> {
  const creativePrompt = `${input.prompt}. Create an authentic vertical UGC product video. Preserve the product packaging and brand details from the reference image. Use natural handheld energy, believable creator delivery, clean product close-ups, a strong opening hook, and a confident call to action.`;
  const args = [
    "generate", "create", "marketing_studio_video",
    "--prompt", creativePrompt,
    "--image", input.imagePath,
    "--mode", "ugc",
    "--duration", "15",
    "--resolution", "720p",
    "--aspect_ratio", "9:16",
    "--generate_audio", String(input.generateAudio),
    "--wait", "--wait-timeout", "30m", "--json",
  ];

  return new Promise((resolve, reject) => {
    const child = spawn("higgsfield", args, { env: process.env });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk.toString(); });
    child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
    child.on("error", (error: NodeJS.ErrnoException) => {
      reject(new Error(error.code === "ENOENT"
        ? "Higgsfield CLI is not installed. Install @higgsfield/cli and run `higgsfield auth login`."
        : error.message));
    });
    child.on("close", (code) => {
      if (code !== 0) return reject(new Error(stderr.trim() || `Higgsfield exited with code ${code}`));
      try {
        const url = findVideoUrl(JSON.parse(stdout));
        if (!url) return reject(new Error("Higgsfield completed, but returned no video URL."));
        resolve(url);
      } catch {
        const url = stdout.match(/https?:\/\/\S+?\.(?:mp4|webm)(?:\?\S*)?/i)?.[0];
        if (url) resolve(url);
        else reject(new Error("Could not read the completed Higgsfield response."));
      }
    });
  });
}
