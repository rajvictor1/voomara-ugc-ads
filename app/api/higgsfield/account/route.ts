import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getRuntimeMode } from "@/lib/runtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const execFileAsync = promisify(execFile);
const accountSchema = z.object({
  credits: z.number().nonnegative(),
  email: z.string().email(),
  subscription_plan_type: z.string().min(1),
});

export async function GET() {
  if (getRuntimeMode() === "remote-api") {
    return NextResponse.json({ connected: true, plan: "API", message: "Secure Higgsfield API connection configured" });
  }
  if (getRuntimeMode() === "public-demo") {
    return NextResponse.json({ connected: false, message: "Public preview — connect the Higgsfield CLI locally for paid generation." }, { headers: { "Cache-Control": "no-store" } });
  }
  try {
    const { stdout } = await execFileAsync("higgsfield", ["account", "status", "--json"], { timeout: 10_000, maxBuffer: 64 * 1024 });
    const account = accountSchema.parse(JSON.parse(stdout));
    return NextResponse.json({ connected: true, credits: account.credits, email: account.email, plan: account.subscription_plan_type }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    const message = code === "ENOENT"
      ? "Higgsfield CLI is not installed. Run `npm install -g @higgsfield/cli`."
      : "Higgsfield is not authenticated. Run `higgsfield auth login`, then refresh.";
    return NextResponse.json({ connected: false, message }, { headers: { "Cache-Control": "no-store" } });
  }
}
