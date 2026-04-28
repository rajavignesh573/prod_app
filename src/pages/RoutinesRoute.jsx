import { Profiler } from 'react';
import { RoutinesView } from '@/features/routines';
import { logProfilerMetrics } from '@/lib/react/profiler';

function RoutinesRoute(props) {
  return (
    <Profiler id="DailyRoutinePage" onRender={logProfilerMetrics}>
      <RoutinesView {...props} />
    </Profiler>
  );
}

export default RoutinesRoute;
