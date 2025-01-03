// @mui
import { alpha } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
// icons
import AddToQueueIcon from "@mui/icons-material/AddToQueue";
//
import VideoOptions from "./VideoOptions";

// ----------------------------------------------------------------------

export default function VideoListTableToolbar({ title, isLoading, numSelected, onAddVideosToQueue }) {
    return (
        <Toolbar
            sx={{
                ...(numSelected > 0 && {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
                }),
            }}
        >
            {numSelected > 0 ? (
                <Typography sx={{ flex: "1 1 100%" }} color="inherit" variant="subtitle1" component="div">
                    Đã chọn {numSelected} video
                </Typography>
            ) : (
                <Typography sx={{ flex: "1 1 100%" }} variant="h6" id="tableTitle" component="div">
                    {title}
                </Typography>
            )}

            {numSelected > 0 && (
                <>
                    <VideoOptions />
                    <Tooltip title="Thêm vào hàng chờ">
                        <IconButton onClick={onAddVideosToQueue} disabled={isLoading}>
                            <AddToQueueIcon />
                        </IconButton>
                    </Tooltip>
                </>
            )}
        </Toolbar>
    );
}
