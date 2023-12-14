"use client"

/* Core */
import { Provider } from "react-redux"

/* Instruments */
import { reduxStore } from "@/libs/redux"

export default function ReduxProvider({ children }) {
  return <Provider store={reduxStore}>{children}</Provider>
}
