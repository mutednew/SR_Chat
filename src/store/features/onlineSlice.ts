import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface OnlineState {
    users: string[];
}

const initialState: OnlineState = {
    users: [],
}

export const onlineSlice = createSlice({
    name: "online",
    initialState,
    reducers: {
        setOnlineUsers(state, action: PayloadAction<string[]>) {
            state.users = action.payload;
        }
    }
});

export const { setOnlineUsers } = onlineSlice.actions;
export default onlineSlice.reducer;