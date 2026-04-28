export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
  isActive?: boolean;
}

export interface Task {
  id: string;
  assigneeId: string;
  createdById: string;
  clientName: string;
  category: string;
  label: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'YET_TO_WORK' | 'IN_PROGRESS' | 'COMPLETED';
  workDescription: string;
  createdBy?: string;
  createdAt?: string;
  deadline?: string;
  voiceNoteUrl?: string;
}

export interface GoalProgressLog {
  id: string;
  workNote: string;
  createdBy: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  assigneeId: string;
  createdById: string;
  assignedBy?: string;
  startDate: string;
  endDate: string;
  percentage: number;
  notes?: string;
  createdAt?: string;
  daysLeft?: number;
  progressLogs?: GoalProgressLog[];
}

export interface GoalCreatePayload {
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  assigneeId: string;
  percentage: number;
  notes?: string;
}

export interface Routine {
  id: string;
  category: string;
  title: string;
  description: string;
  assigneeId: string;
  createdById: string;
  createdBy?: string;
  assignedBy?: string;
  doneToday: boolean;
  createdAt?: string;
  doneByDate?: Record<string, boolean>;
  doneDays: number;
  totalTrackedDays: number;
  completionPercentage: number;
  routineLogs?: RoutineLog[];
}

export interface RoutineLog {
  id: string;
  doneDate: string;
  isDone: boolean;
  updatedBy: string;
  updatedAt: string;
}

export interface RoutineCreatePayload {
  category: string;
  title: string;
  description: string;
  assigneeId: string;
}

export interface AddonItem {
  value: string;
  createdAt?: string;
}

export interface Addons {
  clients: AddonItem[];
  taskCategories: AddonItem[];
  routineCategories: AddonItem[];
  goalCategories: AddonItem[];
  categories: AddonItem[];
}

export interface LoginResponse {
  token: string;
  user: User;
}

export type PaymentCycleType = 'weekly' | 'biweekly' | 'monthly' | 'custom_days';
export type DueDayRuleType = 'fixed_day' | 'days_after_invoice';
export type PaymentStatus = 'upcoming' | 'due_today' | 'overdue' | 'paid';

export interface ClientPayment {
  id: string;
  clientName: string;
  paymentCycleType: PaymentCycleType;
  billingStartDate: string;
  dueDayRule: { type: DueDayRuleType; value: number };
  customCycleDays?: number | null;
  lastPaidDate?: string | null;
  amountPaid: number;
  nextDueDate: string;
  status: PaymentStatus;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClientPaymentUpsertPayload {
  paymentCycleType: PaymentCycleType;
  billingStartDate: string;
  dueDayRule: { type: DueDayRuleType; value: number };
  customCycleDays?: number | null;
  lastPaidDate?: string | null;
  amountPaid?: number;
  notes?: string;
}
