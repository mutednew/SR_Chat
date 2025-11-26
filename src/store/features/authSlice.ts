import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IUser } from "@/types/userType";

interface AuthState {
    user: IUser | null;
    token: string | null;
}

const initialState: AuthState = {
    user: typeof window !== "undefined" ? JSON.parse(localStorage.getItem("chat_user") || "null") : null,
    token: typeof window !== "undefined" ? localStorage.getItem("chat_token") : null,
};

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<{ user: IUser; token: string }>) => {
            const { user, token } = action.payload;
            state.user = user;
            state.token = token;

            localStorage.setItem("chat_user", JSON.stringify(user));
            localStorage.setItem("chat_token", token);
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            localStorage.removeItem("chat_user");
            localStorage.removeItem("chat_token");
        },
    },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;