import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Z_INDEX } from '../constants';

interface ModalProps {
  isOpen: boolean;
  children: React.ReactNode;
}

/** Portal-based modal that renders into document.body to escape host app CSS stacking */
export function Modal({ isOpen, children }: ModalProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const container = document.createElement('div');
    container.id = 'appmap-modal-root';
    document.body.appendChild(container);
    containerRef.current = container;

    return () => {
      document.body.removeChild(container);
      containerRef.current = null;
    };
  }, []);

  if (!isOpen || !containerRef.current) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        bottom: 80,
        right: 20,
        width: 'min(720px, calc(100vw - 40px))',
        height: 'min(560px, calc(100vh - 120px))',
        zIndex: Z_INDEX.modal,
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid #27272a',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        background: '#0f0f10',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {children}
    </div>,
    containerRef.current,
  );
}
