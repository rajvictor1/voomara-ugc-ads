import { NextResponse } from "next/server";
import { getRuntimeMode } from "@/lib/runtime";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ mode: getRuntimeMode() }, { headers: { "Cache-Control": "no-store" } });
}
