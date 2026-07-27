import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getRuntimeMode } from "@/lib/runtime";
import { createSteps } from "@/lib/workflow/definition";
import { executeWorkflow } from "@/lib/workflow/executor";
import { listRuns, saveRun } from "@/lib/workflow/store";
import type { WorkflowRun } from "@/types/workflow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await listRuns(), { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const form = await request.formData();
  const publicDemo = getRuntimeMode() === "public-demo";
  const demo = publicDemo || form.get("demo") === "true";
  const file = form.get("image");
  const prompt = String(form.get("prompt") || "Show why this product belongs in a creator's daily routine").slice(0, 1200);
  const generateAudio = form.get("generateAudio") !== "false";

  if (!demo && !(file instanceof File)) {
    return NextResponse.json({ error: "Choose a product image before starting the workflow." }, { status: 400 });
  }

  const id = randomUUID();
  let productImagePath: string | undefined;
  if (file instanceof File && !publicDemo) {
    if (!file.type.startsWith("image/") || file.size > 12 * 1024 * 1024) {
      return NextResponse.json({ error: "Use a JPG, PNG, or WebP image smaller than 12 MB." }, { status: 400 });
    }
    const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const uploadsDirectory = path.join(process.cwd(), "data", "uploads");
    await mkdir(uploadsDirectory, { recursive: true });
    productImagePath = path.join(uploadsDirectory, `${id}.${extension}`);
    await writeFile(productImagePath, Buffer.from(await file.arrayBuffer()));
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
  setTimeout(() => void executeWorkflow(id), 10);
  return NextResponse.json(run, { status: 201 });
}
