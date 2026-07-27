export type RuntimeMode = "local-cli" | "public-demo";

export function getRuntimeMode(): RuntimeMode {
  if (process.env.UGC_RUNTIME_MODE === "local-cli") return "local-cli";
  if (process.env.UGC_RUNTIME_MODE === "public-demo") return "public-demo";
  return process.env.VERCEL ? "public-demo" : "local-cli";
}
