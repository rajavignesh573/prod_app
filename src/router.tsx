import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import type { Addons, ClientPayment, ClientPaymentUpsertPayload, Goal, GoalCreatePayload, Routine, RoutineCreatePayload, Task, User } from '@/types';

const loadDashboardRoute = () => import('@/pages/DashboardRoute');
const loadTasksRoute = () => import('@/pages/TasksRoute');
const loadGoalsRoute = () => import('@/pages/GoalsRoute');
const loadRoutinesRoute = () => import('@/pages/RoutinesRoute');
const loadUsersRoute = () => import('@/pages/UsersRoute');
const loadAddonsRoute = () => import('@/pages/AddonsRoute');
const loadAccountSettingsRoute = () => import('@/pages/AccountSettingsRoute');
const loadToolsRoute = () => import('@/pages/ToolsRoute');

const DashboardRoute = lazy(loadDashboardRoute);
const TasksRoute = lazy(loadTasksRoute);
const GoalsRoute = lazy(loadGoalsRoute);
const RoutinesRoute = lazy(loadRoutinesRoute);
const UsersRoute = lazy(loadUsersRoute);
const AddonsRoute = lazy(loadAddonsRoute);
const AccountSettingsRoute = lazy(loadAccountSettingsRoute);
const ToolsRoute = lazy(loadToolsRoute);

const routePrefetchers = {
  '/dashboard': loadDashboardRoute,
  '/tasks': loadTasksRoute,
  '/goals': loadGoalsRoute,
  '/daily-routine': loadRoutinesRoute,
  '/users': loadUsersRoute,
  '/addons': loadAddonsRoute,
  '/account-settings': loadAccountSettingsRoute,
  '/tools': loadToolsRoute
};

type RoutePrefetchPath = keyof typeof routePrefetchers;

export function prefetchRoute(pathname: string) {
  routePrefetchers[pathname as RoutePrefetchPath]?.();
}

function RouteFallback() {
  return <div className="p-4 text-sm text-slate-500">Loading page...</div>;
}

interface AppRouterProps {
  currentUser: User;
  users: User[];
  tasks: Task[];
  addons: Addons;
  clientPayments: ClientPayment[];
  visibleTasks: Task[];
  visibleGoals: Goal[];
  visibleRoutines: Routine[];
  onAddTask: (payload: Omit<Task, 'id'>) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onUpdateTaskStatus: (taskId: string, status: Task['status']) => Promise<void>;
  onUploadVoiceNote: (file: File) => Promise<{ key: string }>;
  onCreateGoal: (payload: GoalCreatePayload) => Promise<void>;
  onAddGoalProgress: (
    goalId: string,
    payload: { workNote: string; percentage: number }
  ) => Promise<void>;
  onDeleteGoal: (goalId: string) => Promise<void>;
  onCreateRoutine: (payload: RoutineCreatePayload) => Promise<void>;
  onToggleRoutine: (routineId: string, isDone: boolean) => Promise<void>;
  onDeleteRoutine: (routineId: string) => Promise<void>;
  onCreateUser: (payload: { name: string; email: string; role: string; password: string }) => Promise<void>;
  onSetUserAccess: (userId: string, isActive: boolean) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
  onAddAddonValue: (type: keyof Addons, value: string) => Promise<void>;
  onRemoveAddonValue: (type: keyof Addons, value: string) => Promise<void>;
  onUpdateAddonValue: (type: keyof Addons, oldValue: string, newValue: string) => Promise<void>;
  onUpsertClientPayment: (clientName: string, payload: ClientPaymentUpsertPayload) => Promise<void>;
  onMarkClientPaymentPaid: (
    clientName: string,
    payload: { paidDate?: string; amountPaid: number; notes?: string }
  ) => Promise<void>;
}

function AppRouter(props: AppRouterProps) {
  const isAdmin = props.currentUser.role === 'admin';
  const userHomePath = isAdmin ? '/dashboard' : '/tasks';

  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Navigate to={userHomePath} replace />} />
        <Route path="/dashboard" element={isAdmin ? <DashboardRoute tasks={props.visibleTasks} goals={props.visibleGoals} routines={props.visibleRoutines} allUsers={props.users} clientPayments={props.clientPayments} onUpsertClientPayment={props.onUpsertClientPayment} onMarkClientPaymentPaid={props.onMarkClientPaymentPaid} /> : <Navigate to="/tasks" replace />} />
        <Route path="/tasks" element={<TasksRoute tasks={props.visibleTasks} allUsers={props.users} activeUser={props.currentUser} addons={props.addons} onAddTask={props.onAddTask} onDeleteTask={props.onDeleteTask} onUpdateTaskStatus={props.onUpdateTaskStatus} onUploadVoiceNote={props.onUploadVoiceNote} />} />
        <Route path="/goals" element={<GoalsRoute goals={props.visibleGoals} allUsers={props.users} addons={props.addons} activeUser={props.currentUser} onCreateGoal={props.onCreateGoal} onAddGoalProgress={props.onAddGoalProgress} onDeleteGoal={props.onDeleteGoal} />} />
        <Route path="/daily-routine" element={<RoutinesRoute routines={props.visibleRoutines} allUsers={props.users} activeUser={props.currentUser} addons={props.addons} onCreateRoutine={props.onCreateRoutine} onToggleRoutine={props.onToggleRoutine} onDeleteRoutine={props.onDeleteRoutine} />} />
        <Route path="/users" element={isAdmin ? <UsersRoute users={props.users} activeUser={props.currentUser} tasks={props.tasks} onCreateUser={props.onCreateUser} onSetUserAccess={props.onSetUserAccess} onDeleteUser={props.onDeleteUser} /> : <Navigate to="/tasks" replace />} />
        <Route path="/account-settings" element={<AccountSettingsRoute currentUser={props.currentUser} />} />
        <Route path="/tools" element={<ToolsRoute currentUser={props.currentUser} />} />
        <Route path="/addons" element={isAdmin ? <AddonsRoute addons={props.addons} activeUser={props.currentUser} onAddValue={props.onAddAddonValue} onRemoveValue={props.onRemoveAddonValue} onUpdateValue={props.onUpdateAddonValue} /> : <Navigate to="/tasks" replace />} />
      </Routes>
    </Suspense>
  );
}

export default AppRouter;
