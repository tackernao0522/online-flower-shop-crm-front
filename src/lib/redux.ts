import { configureStore } from "@reduxjs/toolkit";
import { createWrapper } from "next-redux-wrapper";
import authReducer from "../features/auth/authSlice";
import customersReducer from "../features/customers/customersSlice";
import usersReducer from "../features/users/usersSlice";

export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      customers: customersReducer,
      users: usersReducer,
    },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export const wrapper = createWrapper<AppStore>(makeStore);

export const store = makeStore();

export const selectUsers = (state: RootState) => state.users;
