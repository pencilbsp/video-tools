import { toast } from "sonner"
import { createSlice } from "@reduxjs/toolkit"
//
import { getStyles } from "./thunks"

const initialState = {
  page: 0,
  total: 0,
  take: 10,
  selected: [],
  order: "desc",
  styleList: [],
  status: "idle",
  orderBy: "updatedAt",
}

export const styleSlice = createSlice({
  name: "style",
  initialState,
  reducers: {
    select(state, action) {
      const index = state.selected.indexOf(action.payload)
      if (index > -1) state.selected.splice(index, 1)
      else state.selected.push(action.payload)
    },

    selectAll(state, action) {
      state.selected = action.payload ? state.styleList.map(({ id }) => id) : []
    },
  },
  extraReducers: (builder) => {
    // getStyles
    builder
      .addCase(getStyles.pending, (state) => {
        state.status = "loading"
      })
      .addCase(getStyles.fulfilled, (state, action) => {
        state.status = "idle"
        state.page = action.payload.page
        state.take = action.payload.take
        state.order = action.payload.order
        state.total = action.payload.total
        state.orderBy = action.payload.orderBy
        state.styleList = action.payload.styleList
        const styleIds = action.payload.styleList.map((e) => e.id)
        state.selected = state.selected.filter((id) => styleIds.includes(id))
      })
      .addCase(getStyles.rejected, (state, action) => {
        state.status = "idle"
        toast.error(action.payload)
      })
  },
})
