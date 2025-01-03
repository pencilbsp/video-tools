import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
// auth
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function AuthLayout({ children }) {
    const session = await getServerSession(authOptions);
    if (session) return redirect("/start");

    return children;
}
