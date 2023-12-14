/* Core */
import { configureStore } from "@reduxjs/toolkit"
import { useSelector as useReduxSelector, useDispatch as useReduxDispatch } from "react-redux"

/* Instruments */
import { reducer } from "./rootReducer"
import { middleware } from "./middleware"

export const reduxStore = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({ serializableCheck: false }).concat(middleware)
  },
})

export const useSelector = useReduxSelector
export const useDispatch = () => useReduxDispatch()
