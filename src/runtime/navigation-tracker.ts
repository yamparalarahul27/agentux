export interface NavigationEvent {
  from: string;
  to: string;
  timestamp: number;
}

/** Tracks navigation events by patching browser history APIs */
const MAX_EVENTS = 1000;

export class NavigationTracker {
  private events: NavigationEvent[] = [];
  private currentPath: string;
  private cleanup: (() => void) | null = null;

  constructor() {
    this.currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
  }

  /** Start tracking navigation events */
  start(): void {
    if (typeof window === 'undefined') return;
    if (this.cleanup) return; // Already tracking

    this.currentPath = window.location.pathname;

    // Patch pushState
    const originalPushState = history.pushState.bind(history);
    history.pushState = (...args: Parameters<typeof history.pushState>) => {
      const from = this.currentPath;
      originalPushState(...args);
      const to = window.location.pathname;
      this.recordNavigation(from, to);
    };

    // Patch replaceState
    const originalReplaceState = history.replaceState.bind(history);
    history.replaceState = (...args: Parameters<typeof history.replaceState>) => {
      const from = this.currentPath;
      originalReplaceState(...args);
      const to = window.location.pathname;
      this.recordNavigation(from, to);
    };

    // Listen for back/forward
    const onPopState = () => {
      const from = this.currentPath;
      const to = window.location.pathname;
      this.recordNavigation(from, to);
    };
    window.addEventListener('popstate', onPopState);

    this.cleanup = () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      window.removeEventListener('popstate', onPopState);
    };
  }

  /** Stop tracking and restore original APIs */
  stop(): void {
    this.cleanup?.();
    this.cleanup = null;
  }

  /** Get all recorded navigation events */
  getEvents(): NavigationEvent[] {
    return [...this.events];
  }

  /** Get unique navigation edges (deduplicated from→to pairs) */
  getUniqueEdges(): Array<{ from: string; to: string }> {
    const seen = new Set<string>();
    const edges: Array<{ from: string; to: string }> = [];

    for (const event of this.events) {
      const key = `${event.from}→${event.to}`;
      if (!seen.has(key)) {
        seen.add(key);
        edges.push({ from: event.from, to: event.to });
      }
    }

    return edges;
  }

  /** Clear all recorded events */
  clear(): void {
    this.events = [];
  }

  private recordNavigation(from: string, to: string): void {
    if (from === to) return; // Skip same-page navigations

    this.currentPath = to;
    this.events.push({
      from,
      to,
      timestamp: Date.now(),
    });

    // Cap events to prevent unbounded memory growth
    if (this.events.length > MAX_EVENTS) {
      this.events = this.events.slice(-MAX_EVENTS);
    }
  }
}
