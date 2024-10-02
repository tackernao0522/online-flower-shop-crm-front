import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type { User, UserState } from "@/types/user";

const initialState: UserState = {
  users: [],
  status: "idle",
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
};

export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (
    {
      page,
      limit = 10,
      search = "",
      role = "",
      isNewSearch = false,
    }: {
      page: number;
      limit?: number;
      search?: string;
      role?: string;
      isNewSearch?: boolean;
    },
    { dispatch, rejectWithValue }
  ) => {
    if (isNewSearch) {
      dispatch(resetUsersState());
    }

    console.log("fetchUsers called with params:", {
      page,
      limit,
      search,
      role,
      isNewSearch,
    });

    try {
      console.log(
        "Sending request to:",
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users`
      );
      console.log("Request params:", { page, limit, search, role });

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          params: { page, limit, search, role },
        }
      );

      console.log("API Response:", response.data);
      console.log("Total users:", response.data.meta.totalCount);
      console.log("Current page:", response.data.meta.currentPage);
      console.log("Total pages:", response.data.meta.totalPages);

      // レスポンスデータに `is_active` フィールドが含まれていることを確認
      const users = response.data.data.map((user: any) => ({
        ...user,
        isActive: user.isActive ?? user.is_active ?? false,
      }));

      return { ...response.data, data: users, isNewSearch };
    } catch (error: any) {
      console.error("Error in fetchUsers:", error);

      if (error.response) {
        console.log("Error response:", error.response.data);
        console.log("Error status:", error.response.status);

        switch (error.response.status) {
          case 400:
            return rejectWithValue("無効なパラメータが指定されました。");
          case 404:
            return {
              data: [],
              meta: {
                currentPage: 1,
                totalPages: 1,
                totalCount: 0,
              },
              isNewSearch,
            };
          case 403:
            return rejectWithValue("この操作を行う権限がありません。");
          default:
            return rejectWithValue(
              error.response.data?.message || "エラーが発生しました。"
            );
        }
      }
      return rejectWithValue("サーバーに接続できません。");
    }
  }
);

export const addUser = createAsyncThunk(
  "users/addUser",
  async (
    userData: Omit<User, "id" | "createdAt" | "updatedAt">,
    { rejectWithValue }
  ) => {
    try {
      console.log("Sending user data to API:", userData);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users`,
        userData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      console.log("API Response:", response.data);
      return {
        ...response.data,
        isActive:
          response.data.isActive ??
          response.data.is_active ??
          userData.isActive,
      };
    } catch (error: any) {
      console.error("Error in addUser:", error);
      return rejectWithValue(error.response?.data || "An error occurred");
    }
  }
);

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async (
    { id, userData }: { id: string; userData: Partial<User> },
    { rejectWithValue }
  ) => {
    try {
      console.log("Sending update request:", userData);
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/${id}`,
        {
          ...userData,
          is_active: userData.isActive, // isActive を is_active に変換
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      console.log("Received response:", response.data);
      return {
        ...response.data,
        isActive: response.data.isActive ?? response.data.is_active,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "An error occurred");
    }
  }
);

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/${id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "An error occurred");
    }
  }
);

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    resetUsers: (state) => {
      state.users = [];
      state.currentPage = 1;
      state.totalPages = 1;
      state.totalCount = 0;
      state.status = "idle";
    },
    resetUsersState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<any>) => {
        state.status = "succeeded";
        if (action.payload.isNewSearch) {
          state.users = action.payload.data;
        } else {
          // 重複を排除しながらユーザーを追加
          const newUsers = action.payload.data.filter(
            (newUser: User) =>
              !state.users.some(
                (existingUser) => existingUser.id === newUser.id
              )
          );
          state.users = [...state.users, ...newUsers];
        }
        state.currentPage = action.payload.meta.currentPage;
        state.totalPages = action.payload.meta.totalPages;
        state.totalCount = action.payload.meta.totalCount;
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "An error occurred";
      })
      .addCase(addUser.fulfilled, (state, action: PayloadAction<User>) => {
        console.log("Adding new user to state:", action.payload);
        state.users.unshift({
          ...action.payload,
          isActive: action.payload.isActive ?? false,
        });
        console.log("Updated users state:", state.users);
        state.totalCount += 1;
      })
      .addCase(updateUser.fulfilled, (state, action: PayloadAction<User>) => {
        const index = state.users.findIndex(
          (user) => user.id === action.payload.id
        );
        if (index !== -1) {
          state.users[index] = {
            ...state.users[index],
            ...action.payload,
            isActive: action.payload.isActive ?? action.payload.is_active,
          };
        }
        console.log("Updated user in state:", state.users[index]);
      })
      .addCase(deleteUser.fulfilled, (state, action: PayloadAction<string>) => {
        state.users = state.users.filter((user) => user.id !== action.payload);
        state.totalCount -= 1;
      });
  },
});

export const { resetUsers, resetUsersState } = usersSlice.actions;
export default usersSlice.reducer;
