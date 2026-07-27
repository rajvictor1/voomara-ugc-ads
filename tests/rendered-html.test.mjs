import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("ships the six-stage Higgsfield workflow contract", async () => {
  const [definition, runner, dashboard] = await Promise.all([
    read("lib/workflow/definition.ts"),
    read("lib/higgsfield/runner.ts"),
    read("app/dashboard/page.tsx"),
  ]);
  for (const id of ["upload", "analyze", "concept", "generate", "render", "deliver"]) {
    assert.match(definition, new RegExp(`id: "${id}"`));
  }
  assert.match(runner, /marketing_studio_video/);
  assert.match(runner, /"--aspect_ratio", "9:16"/);
  assert.match(runner, /"--duration", "15"/);
  assert.match(runner, /"--resolution", "720p"/);
  assert.match(dashboard, /<ProductionMap steps=\{workflowSteps\}/);
  assert.match(dashboard, /<video src=\{outputUrl\}/);
});

test("keeps credentials and uploaded products behind server boundaries", async () => {
  const [promptRoute, workflowRoute, ignore] = await Promise.all([
    read("app/api/prompt/improve/route.ts"),
    read("app/api/workflows/route.ts"),
    read(".gitignore"),
  ]);
  assert.match(promptRoute, /process\.env\.OPENAI_API_KEY/);
  assert.match(promptRoute, /store: false/);
  assert.match(workflowRoute, /12 \* 1024 \* 1024/);
  assert.match(workflowRoute, /"data", "uploads"/);
  assert.match(ignore, /\/data\//);
  assert.match(ignore, /\.env\*/);
});
