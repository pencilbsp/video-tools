import { toast } from "sonner";
import { createSlice } from "@reduxjs/toolkit";
//
import { getCookies } from "./thunks";

const initialState = {
    page: 0,
    total: 0,
    take: 10,
    selected: [],
    order: "desc",
    cookieList: [],
    status: "idle",
    orderBy: "updatedAt",
};

export const cookieSlice = createSlice({
    name: "cookie",
    initialState,
    reducers: {
        select(state, action) {
            const index = state.selected.indexOf(action.payload);
            if (index > -1) state.selected.splice(index, 1);
            else state.selected.push(action.payload);
        },

        selectAll(state, action) {
            state.selected = action.payload ? state.cookieList.map(({ id }) => id) : [];
        },
    },
    extraReducers: (builder) => {
        // getCookies
        builder
            .addCase(getCookies.pending, (state) => {
                state.status = "loading";
            })
            .addCase(getCookies.fulfilled, (state, action) => {
                state.status = "idle";
                state.page = action.payload.page;
                state.take = action.payload.take;
                state.order = action.payload.order;
                state.total = action.payload.total;
                state.orderBy = action.payload.orderBy;
                state.cookieList = action.payload.cookieList;
                const cookieIds = action.payload.cookieList.map((e) => e.id);
                state.selected = state.selected.filter((id) => cookieIds.includes(id));
            })
            .addCase(getCookies.rejected, (state, action) => {
                state.status = "idle";
                toast.error(action.payload);
            });
    },
});
