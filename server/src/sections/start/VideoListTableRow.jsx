import { Fragment, useRef } from "react";
// @mui
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";
import Checkbox from "@mui/material/Checkbox";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import IconButton from "@mui/material/IconButton";
import OutlinedInput from "@mui/material/OutlinedInput";
// icons
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
// libs
import { formatDuration } from "@/libs/format";
// hooks
import useOutsideClick from "@/hooks/useOutsideClick";
// redux
import { useDispatch, videoParserSlice, addVideoToQueue } from "@/libs/redux";
import { options } from "numeral";

// ----------------------------------------------------------------------

const TableCellStyled = styled(TableCell)({ paddingTop: 8, paddingBottom: 8, whiteSpace: "nowrap" });

const InputStyled = styled(OutlinedInput)(({ theme }) => ({
    width: "100%",
    "& .MuiOutlinedInput-notchedOutline": {
        transition: "border-color 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        borderColor: "transparent",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "transparent",
    },
    "& input": {
        transition: "padding-left 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        paddingLeft: 0,
        paddingRight: 0,
        textOverflow: "ellipsis",
        overflow: "hidden",
        whiteSpace: "nowrap",
        "&:focus": {
            paddingLeft: 14,
            paddingRight: 14,
            "+ .MuiOutlinedInput-notchedOutline": {
                borderWidth: 1,
                borderColor: theme.palette.primary.main,
            },
        },
    },
}));

export default function VideoListTableRow({ video, isSelected, isLoading }) {
    const nameRef = useRef(null);
    const dispatch = useDispatch();
    // const [open, setOpen] = useState(false)

    const handleChangeName = () => {
        const name = nameRef.current.value?.trim();
        if (!name) return (nameRef.current.value = video.name);
        if (name !== video.name) dispatch(videoParserSlice.actions.rename({ videoId: video.vid, name }));
    };

    useOutsideClick(nameRef, handleChangeName);

    const handleValidate = (event) => !/\w/.test(event.key) && event.preventDefault();

    const handleSelect = () => dispatch(videoParserSlice.actions.select(video.vid));

    const handleAddVideoToQueue = () => dispatch(addVideoToQueue({ videoId: video.vid }));

    return (
        <Fragment>
            <TableRow
                selected={isSelected}
                sx={{ "& > *": { borderBottom: "unset" }, borderBottom: "unset", cursor: "pointer" }}
            >
                <TableCell padding="checkbox">
                    <Checkbox
                        color="primary"
                        disabled={isLoading}
                        checked={isSelected}
                        onChange={handleSelect}
                        inputProps={{ "aria-labelledby": video.id }}
                    />
                </TableCell>
                <TableCellStyled sx={{ paddingRight: 0 }}>
                    <InputStyled
                        size="small"
                        pattern="^\w+."
                        inputRef={nameRef}
                        placeholder="Tên video"
                        onKeyDown={handleValidate}
                        defaultValue={video.name}
                    />
                </TableCellStyled>
                <TableCellStyled align="right">{video.vid}</TableCellStyled>
                <TableCellStyled align="right">
                    {video.duration ? formatDuration(video.duration) : "00:00:00"}
                </TableCellStyled>
                <TableCellStyled align="right">
                    <Stack spacing={0.75} direction="row" justifyContent="end">
                        {/* {isModified(video.options) && <Chip size="small" label="C" color="info" />} */}
                        {video.requireVip && <Chip size="small" label="VIP" color="error" />}
                        {video.isTrailer && <Chip size="small" label="Trailer" color="primary" />}
                    </Stack>
                </TableCellStyled>
                <TableCellStyled align="right">
                    {/* <Tooltip title="Mở tuỳ chỉnh nhanh">
            <IconButton size="small" disabled={isLoading} aria-label="expand row" onClick={() => setOpen(!open)}>
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </Tooltip> */}

                    <Tooltip title="Thêm vào hàng chờ">
                        <IconButton size="small" disabled={isLoading} onClick={handleAddVideoToQueue}>
                            <KeyboardArrowRightIcon />
                        </IconButton>
                    </Tooltip>
                </TableCellStyled>
            </TableRow>

            {/* <TableRowOption videoId={video.id} options={video.options} open={open} /> */}
        </Fragment>
    );
}
