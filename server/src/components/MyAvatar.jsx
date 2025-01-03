import { useSession } from "next-auth/react";
// utils
import { createAvatar } from "@/libs/theme";
//
import Avatar from "./Avatar";

// ----------------------------------------------------------------------

export default function MyAvatar({ ...other }) {
    const {
        data: { user },
    } = useSession();

    return (
        <Avatar
            alt={user?.name}
            src={user?.image}
            color={user?.image ? "default" : createAvatar(user?.name).color}
            {...other}
        >
            {createAvatar(user?.name).name}
        </Avatar>
    );
}
