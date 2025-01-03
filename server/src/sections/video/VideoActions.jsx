import { toast } from "sonner";
import { useTransition } from "react";
// @mui
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";

// icons
import StopIcon from "@mui/icons-material/Stop";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

// actions
import { sendAction } from "@/actions/video";

export default function VideoActions({ status, id }) {
    const [pending, startTransition] = useTransition();

    const handleSendAction = (action) =>
        startTransition(async () => {
            const result = await sendAction(id, action);
            if (result.error) toast.error(result.error.message);
            else toast.success(result.message);
        });

    if (status.endsWith("ing"))
        return (
            <>
                <Tooltip title="Tạm dừng">
                    <span>
                        <IconButton onClick={() => handleSendAction("pause")}>
                            <PauseIcon sx={{ width: 18, height: 18 }} />
                        </IconButton>
                    </span>
                </Tooltip>
                <Tooltip title="Huỷ">
                    <span>
                        <IconButton onClick={() => handleSendAction("cancel")}>
                            <StopIcon sx={{ width: 18, height: 18 }} />
                        </IconButton>
                    </span>
                </Tooltip>
            </>
        );

    if (status === "paused")
        return (
            <Tooltip title="Tiếp tục">
                <span>
                    <IconButton onClick={() => handleSendAction("resume")}>
                        <PlayArrowIcon sx={{ width: 18, height: 18 }} />
                    </IconButton>
                </span>
            </Tooltip>
        );
}
