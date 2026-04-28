import { Profiler } from 'react';
import { GoalsView } from '@/features/goals';
import { logProfilerMetrics } from '@/lib/react/profiler';

function GoalsRoute(props) {
  return (
    <Profiler id="GoalsPage" onRender={logProfilerMetrics}>
      <GoalsView {...props} />
    </Profiler>
  );
}

export default GoalsRoute;
