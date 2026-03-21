import React from 'react';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const relativeGuard = vi.fn(() => {
  throw new Error('node:path should not be touched by runtime modules');
});

vi.mock('node:path', () => ({
  default: {
    relative: relativeGuard,
  },
  relative: relativeGuard,
}));

describe('runtime tracking', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('does not import node:path or start tracking when disabled', async () => {
    const { NavigationTracker, useRuntimeRoutes } = await import('../../src/runtime');
    const startSpy = vi.spyOn(NavigationTracker.prototype, 'start');

    function Probe() {
      useRuntimeRoutes(false);
      return null;
    }

    const originalPushState = history.pushState;
    render(<Probe />);

    expect(startSpy).not.toHaveBeenCalled();
    expect(history.pushState).toBe(originalPushState);
  });
});
