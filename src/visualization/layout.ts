import dagre from '@dagrejs/dagre';
import type { Node, Edge } from '@xyflow/react';
import { NODE_DIMENSIONS, LAYOUT_SPACING } from '../constants';

/** Apply dagre auto-layout to nodes and edges */
export function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  direction: 'TB' | 'LR' = 'TB',
): { nodes: Node[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: direction,
    nodesep: LAYOUT_SPACING.nodeSep,
    ranksep: LAYOUT_SPACING.rankSep,
  });

  for (const node of nodes) {
    g.setNode(node.id, {
      width: NODE_DIMENSIONS.width,
      height: NODE_DIMENSIONS.height,
    });
  }

  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }

  dagre.layout(g);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = g.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - NODE_DIMENSIONS.width / 2,
        y: nodeWithPosition.y - NODE_DIMENSIONS.height / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}
