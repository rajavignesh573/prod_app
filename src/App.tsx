import { useCallback, useMemo } from 'react';
import AppShell from '@/components/AppShell';
import LoginRoute from '@/pages/LoginRoute';
import AppRouter from '@/router';
import { useAuthStore } from '@/store/authStore';
import { useLoginMutation } from '@/features/auth';
import { useAddAddonValueMutation, useAddonsQuery, useRemoveAddonValueMutation, useUpdateAddonValueMutation } from '@/features/addons';
import { useAddGoalProgressMutation, useCreateGoalMutation, useDeleteGoalMutation, useGoalsQuery } from '@/features/goals';
import { useCreateRoutineMutation, useDeleteRoutineMutation, useRoutinesQuery, useToggleRoutineMutation } from '@/features/routines';
import { useCreateTaskMutation, useDeleteTaskMutation, useTasksQuery, useUpdateTaskStatusMutation, useUploadVoiceNoteMutation } from '@/features/tasks';
import { useCreateUserMutation, useDeleteUserMutation, useSetUserAccessMutation, useUsersQuery } from '@/features/users';
import { useClientPaymentsQuery, useMarkClientPaymentPaidMutation, useUpsertClientPaymentMutation } from '@/features/client-payments';
import type { Addons, ClientPayment, ClientPaymentUpsertPayload, Goal, GoalCreatePayload, Routine, RoutineCreatePayload, Task, User } from '@/types';

type GoalProgressPayload = { workNote: string; percentage: number };

function App() {
  const token = useAuthStore((state) => state.token);
  const currentUser = useAuthStore((state) => state.currentUser);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);

  const loginMutation = useLoginMutation();
  const tasksQuery = useTasksQuery(token);
  const goalsQuery = useGoalsQuery(token);
  const routinesQuery = useRoutinesQuery(token);
  const addonsQuery = useAddonsQuery(token);
  const clientPaymentsQuery = useClientPaymentsQuery(token);
  const usersQuery = useUsersQuery(token, currentUser?.role === 'admin');

  const createTaskMutation = useCreateTaskMutation(token);
  const updateTaskStatusMutation = useUpdateTaskStatusMutation(token);
  const deleteTaskMutation = useDeleteTaskMutation(token);
  const createGoalMutation = useCreateGoalMutation(token);
  const addGoalProgressMutation = useAddGoalProgressMutation(token);
  const deleteGoalMutation = useDeleteGoalMutation(token);
  const createRoutineMutation = useCreateRoutineMutation(token);
  const toggleRoutineMutation = useToggleRoutineMutation(token);
  const deleteRoutineMutation = useDeleteRoutineMutation(token);
  const addAddonValueMutation = useAddAddonValueMutation(token);
  const removeAddonValueMutation = useRemoveAddonValueMutation(token);
  const updateAddonValueMutation = useUpdateAddonValueMutation(token);
  const upsertClientPaymentMutation = useUpsertClientPaymentMutation(token);
  const markClientPaymentPaidMutation = useMarkClientPaymentPaidMutation(token);
  const createUserMutation = useCreateUserMutation(token);
  const setUserAccessMutation = useSetUserAccessMutation(token);
  const deleteUserMutation = useDeleteUserMutation(token);
  const voiceUploadMutation = useUploadVoiceNoteMutation(token);

  const signOut = useCallback(() => clearSession(), [clearSession]);

  const signIn = useCallback(async (email: string, password: string) => {
    const data = await loginMutation.mutateAsync({ email, password });
    setSession(data.token, data.user);
  }, [loginMutation, setSession]);

  const tasks: Task[] = tasksQuery.data || [];
  const goals: Goal[] = goalsQuery.data || [];
  const routines: Routine[] = routinesQuery.data || [];
  const addons: Addons =
    addonsQuery.data || { clients: [], taskCategories: [], routineCategories: [], goalCategories: [], categories: [] };
  const users: User[] =
    currentUser?.role === 'admin' ? usersQuery.data || [] : currentUser ? [currentUser] : [];
  const clientPayments: ClientPayment[] = clientPaymentsQuery.data || [];

  const loading = tasksQuery.isLoading || goalsQuery.isLoading || routinesQuery.isLoading || addonsQuery.isLoading || clientPaymentsQuery.isLoading || usersQuery.isLoading;

  const visibleTasks = useMemo(
    () => (currentUser?.role === 'admin' ? tasks : tasks.filter((task) => task.assigneeId === currentUser?.id)),
    [currentUser, tasks]
  );
  const visibleGoals = useMemo(
    () => (currentUser?.role === 'admin' ? goals : goals.filter((goal) => goal.assigneeId === currentUser?.id)),
    [currentUser, goals]
  );
  const visibleRoutines = useMemo(
    () =>
      currentUser?.role === 'admin'
        ? routines
        : routines.filter((routine) => routine.assigneeId === currentUser?.id),
    [currentUser, routines]
  );

  const onAddTask = useCallback(async (payload: Omit<Task, 'id'>) => {
    await createTaskMutation.mutateAsync({
      ...payload,
      assigneeId: currentUser?.role === 'user' ? currentUser.id : payload.assigneeId
    });
  }, [createTaskMutation, currentUser]);

  const onUpdateTaskStatus = useCallback(async (taskId: string, status: Task['status']) => {
    await updateTaskStatusMutation.mutateAsync({ taskId, status });
  }, [updateTaskStatusMutation]);

  const onDeleteTask = useCallback(async (taskId: string) => {
    await deleteTaskMutation.mutateAsync(taskId);
  }, [deleteTaskMutation]);

  const onCreateGoal = useCallback(async (payload: GoalCreatePayload) => {
    await createGoalMutation.mutateAsync({
      ...payload,
      assigneeId: currentUser?.role === 'user' ? currentUser.id : payload.assigneeId
    });
  }, [createGoalMutation, currentUser]);

  const onAddGoalProgress = useCallback(async (goalId: string, payload: GoalProgressPayload) => {
    await addGoalProgressMutation.mutateAsync({ goalId, payload });
  }, [addGoalProgressMutation]);

  const onDeleteGoal = useCallback(async (goalId: string) => {
    await deleteGoalMutation.mutateAsync(goalId);
  }, [deleteGoalMutation]);

  const onCreateRoutine = useCallback(async (payload: RoutineCreatePayload) => {
    await createRoutineMutation.mutateAsync({
      ...payload,
      assigneeId: currentUser?.role === 'user' ? currentUser.id : payload.assigneeId
    });
  }, [createRoutineMutation, currentUser]);

  const onToggleRoutine = useCallback(async (routineId: string, isDone: boolean) => {
    await toggleRoutineMutation.mutateAsync({ routineId, isDone });
  }, [toggleRoutineMutation]);

  const onDeleteRoutine = useCallback(async (routineId: string) => {
    await deleteRoutineMutation.mutateAsync(routineId);
  }, [deleteRoutineMutation]);

  const onAddAddonValue = useCallback(async (type: keyof Addons, value: string) => {
    await addAddonValueMutation.mutateAsync({ type, value });
  }, [addAddonValueMutation]);

  const onRemoveAddonValue = useCallback(async (type: keyof Addons, value: string) => {
    await removeAddonValueMutation.mutateAsync({ type, value });
  }, [removeAddonValueMutation]);

  const onUpdateAddonValue = useCallback(async (type: keyof Addons, oldValue: string, newValue: string) => {
    await updateAddonValueMutation.mutateAsync({ type, oldValue, newValue });
  }, [updateAddonValueMutation]);

  const onUpsertClientPayment = useCallback(async (clientName: string, payload: ClientPaymentUpsertPayload) => {
    await upsertClientPaymentMutation.mutateAsync({ clientName, payload });
  }, [upsertClientPaymentMutation]);

  const onMarkClientPaymentPaid = useCallback(async (clientName: string, payload: { paidDate?: string; amountPaid: number; notes?: string }) => {
    await markClientPaymentPaidMutation.mutateAsync({ clientName, payload });
  }, [markClientPaymentPaidMutation]);

  const onCreateUser = useCallback(
    async (payload: { name: string; email: string; role: string; password: string }) => {
    await createUserMutation.mutateAsync(payload);
  },
    [createUserMutation]
  );

  const onSetUserAccess = useCallback(async (userId: string, isActive: boolean) => {
    await setUserAccessMutation.mutateAsync({ userId, isActive });
  }, [setUserAccessMutation]);

  const onDeleteUser = useCallback(async (userId: string) => {
    await deleteUserMutation.mutateAsync(userId);
  }, [deleteUserMutation]);

  const onUploadVoiceNote = useCallback(async (file: File) => {
    return voiceUploadMutation.mutateAsync({ file });
  }, [voiceUploadMutation]);

  if (!token || !currentUser) return <LoginRoute onLogin={signIn} />;
  if (loading) return <div className="p-8 text-sm text-slate-600">Loading app data...</div>;

  return (
    <AppShell currentUser={currentUser} onSignOut={signOut}>
      <AppRouter
        currentUser={currentUser}
        users={users}
        tasks={tasks}
        addons={addons}
        clientPayments={clientPayments}
        visibleTasks={visibleTasks}
        visibleGoals={visibleGoals}
        visibleRoutines={visibleRoutines}
        onAddTask={onAddTask}
        onDeleteTask={onDeleteTask}
        onUpdateTaskStatus={onUpdateTaskStatus}
        onUploadVoiceNote={onUploadVoiceNote}
        onCreateGoal={onCreateGoal}
        onAddGoalProgress={onAddGoalProgress}
        onDeleteGoal={onDeleteGoal}
        onCreateRoutine={onCreateRoutine}
        onToggleRoutine={onToggleRoutine}
        onDeleteRoutine={onDeleteRoutine}
        onCreateUser={onCreateUser}
        onSetUserAccess={onSetUserAccess}
        onDeleteUser={onDeleteUser}
        onAddAddonValue={onAddAddonValue}
        onRemoveAddonValue={onRemoveAddonValue}
        onUpdateAddonValue={onUpdateAddonValue}
        onUpsertClientPayment={onUpsertClientPayment}
        onMarkClientPaymentPaid={onMarkClientPaymentPaid}
      />
    </AppShell>
  );
}

export default App;
