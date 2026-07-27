export type RuntimeMode = "remote-api" | "local-cli" | "public-demo";

export function getRuntimeMode(): RuntimeMode {
  if (process.env.UGC_RUNTIME_MODE === "remote-api") return "remote-api";
  if (process.env.UGC_RUNTIME_MODE === "local-cli") return "local-cli";
  if (process.env.UGC_RUNTIME_MODE === "public-demo") return "public-demo";
  if (process.env.HF_CREDENTIALS) return "remote-api";
  return process.env.VERCEL ? "public-demo" : "local-cli";
}
