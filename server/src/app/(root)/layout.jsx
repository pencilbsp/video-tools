import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
// @mui
import { Container } from "@mui/material";
// auth
import { authOptions } from "../api/auth/[...nextauth]/route";
// components
import Header from "@/components/Header";
import { NextAuthProvider } from "@/components/AuthProvider";

export default async function RootLayout({ children }) {
    const session = await getServerSession(authOptions);
    if (!session) return redirect("/login");

    return (
        <NextAuthProvider session={session}>
            <Header />
            <Container
                maxWidth="md"
                component="main"
                sx={{
                    paddingTop: 3,
                    height: "calc(100% - 56px)",
                }}
            >
                {children}
            </Container>
        </NextAuthProvider>
    );
}
