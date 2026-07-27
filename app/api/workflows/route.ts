import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { generateRemoteUgcVideo } from "@/lib/higgsfield/runner";
import { getRuntimeMode } from "@/lib/runtime";
import { createSteps } from "@/lib/workflow/definition";
import { executeWorkflow } from "@/lib/workflow/executor";
import { listRuns, saveRun } from "@/lib/workflow/store";
import type { WorkflowRun } from "@/types/workflow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET() {
  return NextResponse.json(await listRuns(), { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const form = await request.formData();
  const runtimeMode = getRuntimeMode();
  const publicDemo = runtimeMode === "public-demo";
  const demo = publicDemo || form.get("demo") === "true";
  const file = form.get("image");
  const prompt = String(form.get("prompt") || "Show why this product belongs in a creator's daily routine").slice(0, 1200);
  const generateAudio = form.get("generateAudio") !== "false";

  if (!demo && !(file instanceof File)) {
    return NextResponse.json({ error: "Choose a product image before starting the workflow." }, { status: 400 });
  }

  const id = randomUUID();
  let productImagePath: string | undefined;
  let remoteImage: Buffer | undefined;
  let remoteMimeType: string | undefined;
  if (file instanceof File && !publicDemo) {
    if (!file.type.startsWith("image/") || file.size > 12 * 1024 * 1024) {
      return NextResponse.json({ error: "Use a JPG, PNG, or WebP image smaller than 12 MB." }, { status: 400 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    if (runtimeMode === "remote-api") {
      remoteImage = buffer;
      remoteMimeType = file.type;
    } else {
      const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const uploadsDirectory = path.join(process.cwd(), "data", "uploads");
      await mkdir(uploadsDirectory, { recursive: true });
      productImagePath = path.join(uploadsDirectory, `${id}.${extension}`);
      await writeFile(productImagePath, buffer);
    }
  }

  const now = new Date().toISOString();
  const steps = createSteps();
  steps[0] = { ...steps[0], status: "completed", progress: 100, startedAt: now, completedAt: now, message: demo ? "Preview product prepared" : "Product image stored outside the public directory" };
  const run: WorkflowRun = {
    id,
    name: demo ? "Studio preview" : "Product UGC run",
    status: "queued",
    createdAt: now,
    updatedAt: now,
    prompt,
    generateAudio,
    productImagePath,
    demo,
    steps,
  };
  await saveRun(run);
  if (!demo && runtimeMode === "remote-api") {
    try {
      run.status = "running";
      run.steps = run.steps.map((step, index) => index < 3
        ? { ...step, status: "completed", progress: 100, startedAt: now, completedAt: now }
        : step);
      run.steps[3] = { ...run.steps[3], status: "running", progress: 35, startedAt: now, message: "Higgsfield is generating from your uploaded product" };
      await saveRun(run);
      run.outputUrl = await generateRemoteUgcVideo({ image: remoteImage!, mimeType: remoteMimeType!, prompt });
      const completedAt = new Date().toISOString();
      run.steps = run.steps.map((step) => ({ ...step, status: "completed", progress: 100, startedAt: step.startedAt || now, completedAt, message: step.id === "deliver" ? "Video is ready to review and download" : step.message }));
      run.status = "completed";
      await saveRun(run);
      return NextResponse.json(run, { status: 201 });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Higgsfield generation failed";
      run.status = "failed";
      run.error = message;
      run.steps = run.steps.map((step) => step.status === "running" ? { ...step, status: "failed", message } : step);
      await saveRun(run);
      return NextResponse.json(run, { status: 502 });
    }
  }
  setTimeout(() => void executeWorkflow(id), 10);
  return NextResponse.json(run, { status: 201 });
}
