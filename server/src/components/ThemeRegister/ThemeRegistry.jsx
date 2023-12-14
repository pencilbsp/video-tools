"use client"

import * as React from "react"
import { Roboto } from "next/font/google"
import CssBaseline from "@mui/material/CssBaseline"
import { ThemeProvider, createTheme } from "@mui/material/styles"

import { shadows } from "./shadows"
import { palette } from "./palette"
import overrides from "./overrides"
import { customShadows } from "./custom-shadows"
import NextAppDirEmotionCacheProvider from "./EmotionCache"

const roboto = Roboto({
  display: "swap",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
})

export default function ThemeRegistry({ children }) {
  const themeOptions = React.useMemo(
    () => ({
      palette: palette(),
      shadows: shadows(),
      shape: { borderRadius: 12 },
      customShadows: customShadows(),
      typography: { fontFamily: roboto.style.fontFamily },
    }),
    []
  )

  const theme = createTheme(themeOptions)
  theme.components = overrides(theme)

  return (
    <NextAppDirEmotionCacheProvider options={{ key: "mui" }}>
      <ThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        {children}
      </ThemeProvider>
    </NextAppDirEmotionCacheProvider>
  )
}
