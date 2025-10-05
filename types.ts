export interface RodState {
  id: number;
  heavenlyBeadActive: boolean;
  earthlyBeadsActive: number; // 0-4, represents how many are pushed up
}

// ---- New types for Interactive Training ----

export interface TrainingStep {
  title: string;
  instruction: string;
  explanation: string;
  initialState: RodState[];
  targetState: RodState[];
}

export interface TrainingLevel {
  id: number | string;
  title: string;
  description: string;
  category: string;
  steps: TrainingStep[];
}

export interface TrainingCategory {
  name: string;
  levels: TrainingLevel[];
}

// ---- New types for User Roles ----

export type UserRole = 'admin' | 'user';

export interface CurrentUser {
  username: string;
  role: UserRole;
}

// ---- New type for Saved States ----

export interface SavedState {
  name: string;
  rods: RodState[];
}
