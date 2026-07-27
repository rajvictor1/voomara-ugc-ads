"use client";

import { Background, Controls, Handle, Position, ReactFlow, type NodeProps } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { WorkflowStep } from "@/types/workflow";

type MapNode = { id: string; position: { x: number; y: number }; data: WorkflowStep; type: "production" };

function ProductionNode({ data }: NodeProps<MapNode>) {
  return (
    <div className={`flow-node ${data.status === "completed" ? "done" : data.status}`}>
      <Handle type="target" position={Position.Left} />
      <div className="node-top"><span className="node-number">{data.status === "completed" ? "✓" : data.id === "generate" ? "HF" : "•"}</span><span className="node-state">{data.status}</span></div>
      <strong>{data.label}</strong><small>{data.message || data.description}</small>
      <div className="node-progress"><i style={{ width: `${data.progress}%` }} /></div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

const positions = [
  { x: 30, y: 35 }, { x: 260, y: 35 }, { x: 490, y: 35 },
  { x: 490, y: 220 }, { x: 260, y: 220 }, { x: 30, y: 220 },
];

export function ProductionMap({ steps }: { steps: WorkflowStep[] }) {
  const nodes: MapNode[] = steps.map((step, index) => ({ id: step.id, type: "production", position: positions[index], data: step }));
  const edges = steps.slice(0, -1).map((step, index) => ({
    id: `${step.id}-${steps[index + 1].id}`,
    source: step.id,
    target: steps[index + 1].id,
    animated: step.status === "running" || steps[index + 1].status === "running",
    style: { stroke: step.status === "completed" ? "#58ad89" : "#625e68", strokeWidth: 2 },
  }));
  return <ReactFlow nodes={nodes} edges={edges} nodeTypes={{ production: ProductionNode }} fitView minZoom={0.65} maxZoom={1.35} nodesDraggable={false} nodesConnectable={false} proOptions={{ hideAttribution: true }}><Background color="#4b4851" gap={25} size={1}/><Controls showInteractive={false}/></ReactFlow>;
}
