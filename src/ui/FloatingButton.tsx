import React from 'react';
import type { AppMapConfig } from '../types';
import { Z_INDEX } from '../constants';

interface FloatingButtonProps {
  onClick: () => void;
  isOpen: boolean;
  position: NonNullable<AppMapConfig['position']>;
}

const positionStyles: Record<string, React.CSSProperties> = {
  'bottom-right': { bottom: 20, right: 20 },
  'bottom-left': { bottom: 20, left: 20 },
  'top-right': { top: 20, right: 20 },
  'top-left': { top: 20, left: 20 },
};

/** Floating button that toggles the App Map modal */
export function FloatingButton({ onClick, isOpen, position }: FloatingButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={isOpen ? 'Close App Map' : 'Open App Map'}
      style={{
        position: 'fixed',
        ...positionStyles[position],
        zIndex: Z_INDEX.floatingButton,
        width: 48,
        height: 48,
        borderRadius: '50%',
        border: 'none',
        background: isOpen ? '#ef4444' : '#6366f1',
        color: '#fff',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        transition: 'all 0.2s ease',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontSize: '20px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {isOpen ? (
        // Close icon (X)
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 4L16 16M16 4L4 16" />
        </svg>
      ) : (
        // Map icon
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <path d="M10 6.5H14" />
          <path d="M6.5 10V14" />
          <path d="M10 17.5H14" />
          <path d="M17.5 10V14" />
        </svg>
      )}
    </button>
  );
}
