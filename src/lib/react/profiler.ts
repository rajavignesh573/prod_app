import type { ProfilerOnRenderCallback } from 'react';

export const logProfilerMetrics: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration
) => {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug(`[Profiler] ${id} ${phase}`, {
      actualDuration: Math.round(actualDuration * 100) / 100,
      baseDuration: Math.round(baseDuration * 100) / 100
    });
  }
};
