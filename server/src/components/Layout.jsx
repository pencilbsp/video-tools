"use client";
// libs
import { bgGradient } from "@/libs/theme";
// @mui
import Box from "@mui/material/Box";
import { alpha, useTheme } from "@mui/material/styles";
//
import { MotionLazyContainer } from "./Animate";

export default function Layout({ children }) {
    const theme = useTheme();

    return (
        <MotionLazyContainer>
            <Box
                sx={{
                    ...bgGradient({
                        color: alpha(theme.palette.background.default, 0.9),
                        imgUrl: "/overlay_4.jpg",
                    }),
                    height: 1,
                }}
            >
                {children}
            </Box>
        </MotionLazyContainer>
    );
}
