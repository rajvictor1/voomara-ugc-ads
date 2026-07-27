import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getRuntimeMode } from "@/lib/runtime";
import type { WorkflowRun } from "@/types/workflow";

const runsDirectory = getRuntimeMode() === "public-demo"
  ? path.join("/tmp", "voomara-runs")
  : path.join(process.cwd(), "data", "runs");

async function ensureDirectory() {
  await mkdir(runsDirectory, { recursive: true });
}

export async function saveRun(run: WorkflowRun) {
  await ensureDirectory();
  run.updatedAt = new Date().toISOString();
  await writeFile(path.join(runsDirectory, `${run.id}.json`), JSON.stringify(run, null, 2));
  return run;
}

export async function getRun(id: string): Promise<WorkflowRun | null> {
  try {
    return JSON.parse(await readFile(path.join(runsDirectory, `${id}.json`), "utf8")) as WorkflowRun;
  } catch {
    return null;
  }
}

export async function listRuns(): Promise<WorkflowRun[]> {
  await ensureDirectory();
  const files = (await readdir(runsDirectory)).filter((file) => file.endsWith(".json"));
  const runs = await Promise.all(files.map(async (file) =>
    JSON.parse(await readFile(path.join(runsDirectory, file), "utf8")) as WorkflowRun));
  return runs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function updateStep(id: string, stepId: string, patch: Partial<WorkflowRun["steps"][number]>) {
  const run = await getRun(id);
  if (!run) throw new Error("Workflow run not found");
  run.steps = run.steps.map((step) => step.id === stepId ? { ...step, ...patch } : step);
  return saveRun(run);
}
