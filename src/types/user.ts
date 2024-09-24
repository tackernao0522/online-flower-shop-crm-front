export interface User {
  id: string;
  username: string;
  email: string;
  role: "admin" | "staff" | "user";
  isActive: boolean;
  createdAt: string; // 修正
  updatedAt: string;
}

export interface UserState {
  users: User[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}
