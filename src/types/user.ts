export interface User {
  id: string;
  username: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "STAFF";
  isActive: boolean;
  // is_active プロパティを追加（オプショナルにする）
  is_active?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserState {
  users: User[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalCount: number;
}
