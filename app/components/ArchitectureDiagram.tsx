"use client";

import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const nodes: Node[] = [
  {
    id: "user",
    position: { x: 250, y: 0 },
    data: {
      label: "👤 User",
    },
  },
  {
    id: "frontend",
    position: { x: 250, y: 120 },
    data: {
      label: "🌐 Frontend",
    },
  },
  {
    id: "backend",
    position: { x: 250, y: 240 },
    data: {
      label: "⚙️ Backend",
    },
  },
  {
    id: "logic",
    position: { x: 250, y: 360 },
    data: {
      label: "🧠 Business / ML Logic",
    },
  },
  {
    id: "result",
    position: { x: 250, y: 480 },
    data: {
      label: "📊 Result",
    },
  },
];

const edges: Edge[] = [
  {
    id: "user-frontend",
    source: "user",
    target: "frontend",
  },
  {
    id: "frontend-backend",
    source: "frontend",
    target: "backend",
  },
  {
    id: "backend-logic",
    source: "backend",
    target: "logic",
  },
  {
    id: "logic-result",
    source: "logic",
    target: "result",
  },
];

export default function ArchitectureDiagram() {
  return (
    <div className="mt-4 h-[550px] w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
