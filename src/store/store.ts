import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { api } from "@/store/services/api";
import authReducer from "./features/authSlice";
import onlineReducer from "./features/onlineSlice";

const appReducer = {
    [api.reducerPath]: api.reducer,
    auth: authReducer,
    online: onlineReducer,
};

const combinedReducer = combineReducers(appReducer);

const rootReducer = (state: any, action: any): any => {

    if (action.type === "auth/logout") {
        state = undefined;
    }

    return combinedReducer(state, action);
};

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof combinedReducer>;
export type AppDispatch = typeof store.dispatch;