"use client";
import { createAsyncThunk } from "@reduxjs/toolkit";
// actions
import { getStyles as getStylesAction } from "@/actions/style";

export const getStyles = createAsyncThunk("style/getStyles", async function (options, { rejectWithValue, getState }) {
    const { orderBy, order, page, take } = getState().style;
    const params = { orderBy, order, page, take, ...options };
    const result = await getStylesAction(params);

    if (!result.error) return result;
    return rejectWithValue(result.error.message);
});
