import React, { useCallback, useMemo, useState } from 'react';
import type { AppMapConfig, AppMapData } from '../types';
import { DEFAULT_POSITION } from '../constants';
import { FloatingButton } from './FloatingButton';
import { Modal } from './Modal';
import { Toolbar } from './Toolbar';
import { AppMapCanvas } from '../visualization';
import { generateMarkdown, copyToClipboard } from '../export';
import { useRuntimeRoutes } from '../runtime';
import { mergeAppMapData } from '../merge';

interface AppMapProps extends AppMapConfig {}

/** Main AppMap component — renders a floating button that opens an interactive app map */
export function AppMap({
  data: staticData,
  position = DEFAULT_POSITION,
  runtimeDetection = true,
  devOnly = true,
}: AppMapProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Dev-only guard
  if (devOnly && typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') {
    return null;
  }

  // Runtime route detection
  const runtimeData = useRuntimeRoutes();

  // Merge static + runtime data
  const mergedData: AppMapData | null = useMemo(() => {
    if (!staticData && (!runtimeData.routes.length)) {
      return null;
    }

    if (!runtimeDetection || !runtimeData.routes.length) {
      return staticData || null;
    }

    return mergeAppMapData(
      staticData || null,
      runtimeData.routes,
      runtimeData.edges,
    );
  }, [staticData, runtimeData, runtimeDetection]);

  const handleExport = useCallback(() => {
    if (!mergedData) return;
    const markdown = generateMarkdown(mergedData);
    copyToClipboard(markdown);
  }, [mergedData]);

  const handleRelayout = useCallback(() => {
    // Force re-render by toggling state — the canvas will re-layout from data
    setIsOpen(false);
    requestAnimationFrame(() => setIsOpen(true));
  }, []);

  // Don't render anything if there's no data at all
  if (!mergedData) {
    return (
      <FloatingButton
        onClick={() => setIsOpen(!isOpen)}
        isOpen={isOpen}
        position={position}
      />
    );
  }

  return (
    <>
      <FloatingButton
        onClick={() => setIsOpen(!isOpen)}
        isOpen={isOpen}
        position={position}
      />

      <Modal isOpen={isOpen}>
        <Toolbar
          onExport={handleExport}
          onRelayout={handleRelayout}
          onClose={() => setIsOpen(false)}
          routeCount={mergedData.routes.length}
          edgeCount={mergedData.edges.length}
        />
        <div style={{ flex: 1 }}>
          <AppMapCanvas data={mergedData} />
        </div>
      </Modal>
    </>
  );
}
