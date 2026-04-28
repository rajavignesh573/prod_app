import { Profiler } from 'react';
import { TasksView } from '@/features/tasks';
import { logProfilerMetrics } from '@/lib/react/profiler';

function TasksRoute(props) {
  return (
    <Profiler id="TasksPage" onRender={logProfilerMetrics}>
      <TasksView {...props} />
    </Profiler>
  );
}

export default TasksRoute;
