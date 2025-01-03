import { toast } from "sonner";
import { useTransition } from "react";
// @mui
import Toolbar from "@mui/material/Toolbar";
import { alpha } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
// icon
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
// actions
import { deleteStyles } from "@/actions/style";
// redux
import { useDispatch, getStyles } from "@/libs/redux";

// ----------------------------------------------------------------------

export default function StyleTableToolbar(props) {
    const { selected, onOpen, rowCount, currentPage } = props;
    const numSelected = selected.length;

    const dispatch = useDispatch();
    const [pending, startTransition] = useTransition();

    const handleDelete = () => {
        startTransition(async () => {
            const result = await deleteStyles(selected);
            if (result.error) toast.error(result.error.message);
            else {
                toast.success(`Đã xoá thành công ${numSelected} style`);
                const page = rowCount - numSelected === 0 && currentPage > 0 ? currentPage - 1 : currentPage;
                dispatch(getStyles({ page }));
            }
        });
    };

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
                    Đã chọn {numSelected} style
                </Typography>
            ) : (
                <Typography sx={{ flex: "1 1 100%" }} variant="h6" id="tableTitle" component="div">
                    Danh sách style
                </Typography>
            )}

            {numSelected > 0 ? (
                <Tooltip title="Xoá style đã chọn">
                    <IconButton onClick={handleDelete} disabled={pending}>
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>
            ) : (
                <Tooltip title="Thêm cookie mới">
                    <IconButton onClick={onOpen}>
                        <AddIcon />
                    </IconButton>
                </Tooltip>
            )}
        </Toolbar>
    );
}
