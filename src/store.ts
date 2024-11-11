import { configureStore } from "@reduxjs/toolkit";
import { createWrapper } from "next-redux-wrapper";
import authReducer from "./features/auth/authSlice";
import customersReducer from "./features/customers/customersSlice";
import rolesReducer from "./features/roles/rolesSlice";
import usersReducer from "./features/users/usersSlice";
import ordersReducer from "./features/orders/ordersSlice";

// デバッグ用のカスタムミドルウェア
const loggerMiddleware = (store: any) => (next: any) => (action: any) => {
  console.log("Before dispatch:", { action, state: store.getState() });
  const result = next(action);
  console.log("After dispatch:", store.getState());
  return result;
};

// RootState型定義
export interface RootState {
  auth: ReturnType<typeof authReducer>;
  customers: ReturnType<typeof customersReducer>;
  roles: ReturnType<typeof rolesReducer>;
  users: ReturnType<typeof usersReducer>;
  orders: ReturnType<typeof ordersReducer>;
}

// Store作成関数
export const makeStore = () => {
  // Reducerの構成を明示的に定義
  const rootReducer = {
    auth: authReducer,
    customers: customersReducer,
    roles: rolesReducer,
    users: usersReducer,
    orders: ordersReducer, // ordersReducerを確実に追加
  };

  // storeの作成
  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }).concat(loggerMiddleware),
    devTools: process.env.NODE_ENV !== "production",
  });

  // 開発環境での初期状態ログ出力
  if (process.env.NODE_ENV === "development") {
    console.log("Initial Redux State:", store.getState());
  }

  return store;
};

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];

// Next.js wrapper
export const wrapper = createWrapper<AppStore>(makeStore, {
  debug: process.env.NODE_ENV === "development",
});

// グローバルストアインスタンス
const store = makeStore();

// 開発環境でのストア変更監視
if (process.env.NODE_ENV === "development") {
  store.subscribe(() => {
    const state = store.getState();
    console.log("Store updated:", {
      auth: state.auth,
      customers: state.customers,
      orders: state.orders, // ordersの状態を明示的にログ出力
      roles: state.roles,
      users: state.users,
    });
  });
}

export default store;
export const selectUsers = (state: RootState) => state.users;
