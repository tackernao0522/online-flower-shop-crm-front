import { configureStore } from "@reduxjs/toolkit";
import customersReducer from "./features/customers/customersSlice";
import authReducer from "./features/auth/authSlice"; // authReducerをインポート

export const store = configureStore({
  reducer: {
    customers: customersReducer,
    auth: authReducer, // authリデューサーを追加
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
