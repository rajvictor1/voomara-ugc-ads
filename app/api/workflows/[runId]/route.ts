import { NextResponse } from "next/server";
import { getRun } from "@/lib/workflow/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  const run = await getRun(runId);
  if (!run) return NextResponse.json({ error: "Workflow run not found" }, { status: 404 });
  return NextResponse.json(run, { headers: { "Cache-Control": "no-store" } });
}
