import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { resetUsers, resetUsersState } from "../users/usersSlice";

interface User {
  id: string;
  email: string;
  username: string;
  role: "ADMIN" | "MANAGER" | "STAFF";
}

export interface AuthState {
  // ここでエクスポート
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  user:
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "null")
      : null,
  isAuthenticated: false,
};

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch }) => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    dispatch(resetUsersState());
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ token: string; user: User }>) => {
      console.log("Logged in user:", action.payload.user);
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;

      if (typeof window !== "undefined") {
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      }
    },
    setAuthState: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout.fulfilled, (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
    });
  },
});

export const { login, setAuthState, setUser } = authSlice.actions;
export default authSlice.reducer;

export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectToken = (state: { auth: AuthState }) => state.auth.token;
