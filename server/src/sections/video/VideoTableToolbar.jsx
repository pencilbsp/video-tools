import { toast } from "sonner";
import { useTransition } from "react";
// @mui
import Toolbar from "@mui/material/Toolbar";
import { alpha } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
// icon
import DeleteIcon from "@mui/icons-material/Delete";
// actions
import { deleteVideos } from "@/actions/video";

// ----------------------------------------------------------------------

export default function VideoTableToolbar(props) {
    const { selected, children, onDelete } = props;
    const numSelected = selected.length;
    const [pending, startTransition] = useTransition();

    const handleDelete = () => {
        startTransition(async () => {
            const result = await deleteVideos(selected);
            if (result.error) toast.error(result.error.message);
            else {
                const deleteCount = result.deletedIds.length;
                if (deleteCount > 0) {
                    onDelete(result.deletedIds, deleteCount);
                    toast.success(`Đã xoá thành công ${deleteCount} video`);
                }
            }
        });
    };

    if (numSelected === 0) return children;

    return (
        <Toolbar
            sx={{
                ...(numSelected > 0 && {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
                }),
            }}
        >
            <Typography sx={{ flex: 1 }} color="inherit" variant="subtitle1" component="div">
                Đã chọn {numSelected} video
            </Typography>

            <Tooltip title="Xoá video đã chọn">
                <IconButton onClick={handleDelete} disabled={pending}>
                    <DeleteIcon />
                </IconButton>
            </Tooltip>
        </Toolbar>
    );
}
