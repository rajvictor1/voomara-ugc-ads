import type { WorkflowStep } from "@/types/workflow";

export const workflowDefinition: Omit<WorkflowStep, "status" | "progress">[] = [
  { id: "upload", label: "Product input", description: "Securely prepare the product image" },
  { id: "analyze", label: "Visual analysis", description: "Read packaging, shape, and key details" },
  { id: "concept", label: "Creative direction", description: "Build a native UGC concept and prompt" },
  { id: "generate", label: "Higgsfield Studio", description: "Generate a vertical presenter-led ad" },
  { id: "render", label: "Render output", description: "Finalize audio, motion, and delivery" },
  { id: "deliver", label: "Review and download", description: "Make the video available in studio" },
];

export function createSteps(): WorkflowStep[] {
  return workflowDefinition.map((step) => ({ ...step, status: "pending", progress: 0 }));
}
