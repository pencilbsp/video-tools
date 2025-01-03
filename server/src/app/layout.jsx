// lazy image
import "react-lazy-load-image-component/src/effects/blur.css";
import "react-lazy-load-image-component/src/effects/opacity.css";
import "react-lazy-load-image-component/src/effects/black-and-white.css";

import { Toaster } from "sonner";
// components
import Layout from "@/components/Layout";
import ReduxProvider from "@/components/ReduxProvider";
import ThemeRegistry from "@/components/ThemeRegister/ThemeRegistry";

export const metadata = {
    title: "Create Next App",
    description: "Generated by create next app",
};

export default async function RootLayout({ children }) {
    return (
        <html lang="vi" suppressHydrationWarning>
            <body style={{ minHeight: "100vh" }}>
                <Toaster closeButton richColors position="top-right" />
                <ReduxProvider>
                    <Layout>
                        <ThemeRegistry>{children}</ThemeRegistry>
                    </Layout>
                </ReduxProvider>
            </body>
        </html>
    );
}
