"use client"
import { createAsyncThunk } from "@reduxjs/toolkit"
// actions
import { getCookies as getCookiesAction } from "@/actions/cookie"

export const getCookies = createAsyncThunk(
  "cookie/getCookies",
  async function (options, { rejectWithValue, getState }) {
    const { orderBy, order, page, take } = getState().cookie
    const params = { orderBy, order, page, take, ...options }
    const result = await getCookiesAction(params)

    if (!result.error) return result
    return rejectWithValue(result.error.message)
  }
)
