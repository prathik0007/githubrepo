"use client";

import {
  Background,
  Controls,
  ReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

type ArchitectureProps = {
  architecture: {
    nodes: Node[];
    edges: Edge[];
  };
};

export default function ArchitectureDiagram({
  architecture,
}: ArchitectureProps) {
  return (
    <div className="relative mt-4 h-[460px] w-full overflow-hidden rounded-xl border border-zinc-800/90 bg-[#090d13] shadow-inner">
      <div className="absolute right-3 top-3 z-10 rounded-md border border-zinc-800 bg-zinc-950/80 px-2.5 py-1 text-[11px] font-medium text-zinc-400 backdrop-blur-md">
        Interactive Architecture Map (Drag / Zoom)
      </div>
      <ReactFlow
        nodes={architecture.nodes}
        edges={architecture.edges}
        fitView
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#27272a" gap={20} size={1} />
        <Controls className="!border-zinc-800 !bg-zinc-900/90 !fill-white !shadow-lg [&>button]:!border-zinc-800 [&>button]:!bg-zinc-900 [&>button]:!text-zinc-300 hover:[&>button]:!bg-zinc-800" />
      </ReactFlow>
    </div>
  );
}
