import { configureStore } from "@reduxjs/toolkit";
import { api } from "@/store/services/api";
import authReducer from './features/authSlice';
import onlineReducer from "./features/onlineSlice";

export const store = configureStore({
    reducer: {
        [api.reducerPath]: api.reducer,
        auth: authReducer,
        online: onlineReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;