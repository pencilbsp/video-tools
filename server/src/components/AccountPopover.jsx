import Link from "next/link";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
// @mui
import { alpha } from "@mui/material/styles";
import { Box, Divider, Typography, Stack, MenuItem } from "@mui/material";
// components
import MyAvatar from "@/components/MyAvatar";
import MenuPopover from "@/components/MenuPopover";
import IconButtonAnimate from "@/components/Animate/IconButtonAnimate";

// ----------------------------------------------------------------------

const MENU_OPTIONS = [
    {
        label: "Cài đặt",
        linkTo: "/settings",
    },
];

// ----------------------------------------------------------------------

export default function AccountPopover() {
    const {
        data: { user },
    } = useSession();

    const [open, setOpen] = useState(null);

    const handleClose = () => setOpen(null);

    const handleOpen = (event) => setOpen(event.currentTarget);

    return (
        <>
            <IconButtonAnimate
                onClick={handleOpen}
                sx={{
                    p: 0,
                    ...(open && {
                        "&:before": {
                            zIndex: 1,
                            content: "''",
                            width: "100%",
                            height: "100%",
                            borderRadius: "50%",
                            position: "absolute",
                            bgcolor: (theme) => alpha(theme.palette.grey[900], 0.8),
                        },
                    }),
                }}
            >
                <MyAvatar />
            </IconButtonAnimate>

            <MenuPopover
                anchorEl={open}
                open={Boolean(open)}
                onClose={handleClose}
                sx={{
                    p: 0,
                    mt: 1.5,
                    ml: 0.75,
                }}
            >
                <Box sx={{ my: 1.5, px: 2.5 }}>
                    <Typography variant="subtitle2" noWrap>
                        {user?.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary" }} noWrap>
                        {user?.email}
                    </Typography>
                </Box>

                <Divider sx={{ borderStyle: "dashed" }} />

                <Stack sx={{ p: 1 }}>
                    {MENU_OPTIONS.map((option) => (
                        <MenuItem key={option.label} href={option.linkTo} component={Link} onClick={handleClose}>
                            {option.label}
                        </MenuItem>
                    ))}

                    <Divider sx={{ borderStyle: "dashed" }} />

                    <MenuItem onClick={() => signOut()} sx={{ color: "error.main" }}>
                        Đăng xuất
                    </MenuItem>
                </Stack>
            </MenuPopover>
        </>
    );
}
