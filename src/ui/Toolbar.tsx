import React, { useState } from 'react';

interface ToolbarProps {
  onExport: () => void;
  onRelayout: () => void;
  onClose: () => void;
  routeCount: number;
  edgeCount: number;
}

/** Toolbar at the top of the App Map modal */
export function Toolbar({ onExport, onRelayout, onClose, routeCount, edgeCount }: ToolbarProps) {
  const [copied, setCopied] = useState(false);

  const handleExport = () => {
    onExport();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        background: '#18181b',
        borderBottom: '1px solid #27272a',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ color: '#e4e4e7', fontWeight: 600, fontSize: '14px' }}>
          App Map
        </span>
        <span style={{ color: '#71717a', fontSize: '12px' }}>
          {routeCount} screens · {edgeCount} flows
        </span>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <ToolbarButton onClick={onRelayout} title="Re-layout">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 019-9 9.75 9.75 0 017 3" />
            <path d="M21 3v6h-6" />
            <path d="M21 12a9 9 0 01-9 9 9.75 9.75 0 01-7-3" />
            <path d="M3 21v-6h6" />
          </svg>
        </ToolbarButton>

        <ToolbarButton onClick={handleExport} title={copied ? 'Copied!' : 'Copy Markdown'}>
          {copied ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
          )}
        </ToolbarButton>

        <ToolbarButton onClick={onClose} title="Close">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4L16 16M16 4L4 16" />
          </svg>
        </ToolbarButton>
      </div>
    </div>
  );
}

function ToolbarButton({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 10px',
        borderRadius: '6px',
        border: '1px solid #27272a',
        background: '#09090b',
        color: '#a1a1aa',
        cursor: 'pointer',
        fontSize: '12px',
        fontFamily: 'inherit',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#27272a';
        e.currentTarget.style.color = '#e4e4e7';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = '#09090b';
        e.currentTarget.style.color = '#a1a1aa';
      }}
    >
      {children}
      <span>{title}</span>
    </button>
  );
}
