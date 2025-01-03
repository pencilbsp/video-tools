"use client";
import NextLink from "next/link";
// @mui
import { Container, Box, styled, alpha, Stack, Link } from "@mui/material";

//
import AccountPopover from "./AccountPopover";
import { usePathname } from "next/navigation";

const HeaderStyled = styled(Box)(({ theme }) => ({
    height: 56,
    position: "sticky",
    top: 0,
    zIndex: theme.zIndex.appBar,
    transition: theme.transitions.create("top", {
        duration: 300,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
    }),
    backdropFilter: "blur(8px)",
    backgroundColor: alpha(theme.palette.background.paper, 0.8),
    boxShadow: theme.shadows[1],
}));

function NavLink({ path, currentPath, children }) {
    const isActive = currentPath.startsWith(path);

    return (
        <Link
            href={path}
            underline="hover"
            component={NextLink}
            sx={{ color: isActive ? "primary.main" : "grey", fontWeight: "bold" }}
        >
            {children}
        </Link>
    );
}

export default function Header() {
    const pathname = usePathname();

    return (
        <HeaderStyled component="header">
            <Container sx={{ height: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" height={1}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <NavLink path="/start" currentPath={pathname}>
                            Bắt đầu
                        </NavLink>
                        <NavLink path="/video" currentPath={pathname}>
                            Video
                        </NavLink>
                        <NavLink path="/cookie" currentPath={pathname}>
                            Cookie
                        </NavLink>
                        <NavLink path="/style" currentPath={pathname}>
                            Style
                        </NavLink>
                        <NavLink path="/cluster" currentPath={pathname}>
                            Cluster
                        </NavLink>
                    </Stack>
                    <Stack>
                        <AccountPopover />
                    </Stack>
                </Stack>
            </Container>
        </HeaderStyled>
    );
}
