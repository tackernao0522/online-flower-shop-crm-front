import { configureStore, Reducer } from "@reduxjs/toolkit";
import { createWrapper } from "next-redux-wrapper";
import authReducer from "./features/auth/authSlice";
import customersReducer, {
  CustomersState,
} from "./features/customers/customersSlice";
import rolesReducer from "./features/roles/rolesSlice";
import usersReducer from "./features/users/usersSlice";

// ストアを作成する関数
export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      customers: customersReducer as Reducer<CustomersState>,
      roles: rolesReducer,
      users: usersReducer,
    },
  });

// store、RootState、およびAppDispatchの型を定義
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

// Next.jsのためのラッパーを作成
export const wrapper = createWrapper<AppStore>(makeStore);

// 実際に使うストアを作成
export const store = makeStore();
