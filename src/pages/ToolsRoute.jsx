import { Profiler } from 'react';
import ToolsPage from '@/pages/ToolsPage';
import { logProfilerMetrics } from '@/lib/react/profiler';

function ToolsRoute(props) {
  return (
    <Profiler id="ToolsPage" onRender={logProfilerMetrics}>
      <ToolsPage {...props} />
    </Profiler>
  );
}

export default ToolsRoute;
