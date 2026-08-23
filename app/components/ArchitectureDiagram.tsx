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
    <div className="mt-4 h-[550px] w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
      <ReactFlow
        nodes={architecture.nodes}
        edges={architecture.edges}
        fitView
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
