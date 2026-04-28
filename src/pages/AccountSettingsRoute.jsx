import { Profiler } from 'react';
import AccountSettingsPage from '@/pages/AccountSettingsPage';
import { logProfilerMetrics } from '@/lib/react/profiler';

function AccountSettingsRoute(props) {
  return (
    <Profiler id="AccountSettingsPage" onRender={logProfilerMetrics}>
      <AccountSettingsPage {...props} />
    </Profiler>
  );
}

export default AccountSettingsRoute;
