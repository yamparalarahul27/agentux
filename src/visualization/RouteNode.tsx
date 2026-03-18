import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

export interface RouteNodeData {
  label: string;
  path: string;
  componentFile?: string;
  framework: string;
  source: 'static' | 'runtime' | 'both';
  [key: string]: unknown;
}

const frameworkColors: Record<string, string> = {
  'nextjs-app': '#0070f3',
  'nextjs-pages': '#0070f3',
  'react-router': '#f44250',
  unknown: '#6366f1',
};

const sourceColors: Record<string, string> = {
  static: '#3b82f6',
  runtime: '#22c55e',
  both: '#a855f7',
};

/** Custom React Flow node for displaying a route/screen */
export const RouteNodeComponent = memo(({ data }: NodeProps) => {
  const nodeData = data as RouteNodeData;
  const frameworkColor = frameworkColors[nodeData.framework] || frameworkColors.unknown;
  const sourceColor = sourceColors[nodeData.source] || sourceColors.static;

  return (
    <div
      style={{
        padding: '12px 16px',
        borderRadius: '8px',
        background: '#18181b',
        border: '1px solid #27272a',
        minWidth: '220px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontSize: '13px',
        color: '#e4e4e7',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: '#6366f1' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span style={{ fontWeight: 600, fontSize: '14px' }}>{nodeData.label}</span>
        <span
          style={{
            fontSize: '9px',
            padding: '2px 6px',
            borderRadius: '4px',
            background: sourceColor,
            color: '#fff',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          {nodeData.source}
        </span>
      </div>

      <div style={{ color: '#a1a1aa', fontSize: '12px', marginBottom: '4px' }}>
        <span style={{ color: frameworkColor, marginRight: '4px' }}>●</span>
        {nodeData.path}
      </div>

      {nodeData.componentFile && (
        <div
          style={{
            color: '#71717a',
            fontSize: '11px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {nodeData.componentFile}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} style={{ background: '#6366f1' }} />
    </div>
  );
});

RouteNodeComponent.displayName = 'RouteNode';
