import { spawn } from "node:child_process";

type GenerationInput = { imagePath: string; prompt: string; generateAudio: boolean };

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
