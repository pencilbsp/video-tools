// @mui
import Box from "@mui/material/Box";
import { visuallyHidden } from "@mui/utils";
import Checkbox from "@mui/material/Checkbox";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableSortLabel from "@mui/material/TableSortLabel";

// ----------------------------------------------------------------------

const headCells = [
    {
        id: "name",
        label: "Tên",
        minWidth: 300,
        sx: { pl: 0 },
    },
    {
        id: "createdAt",
        align: "right",
        label: "Thời gian thêm",
        sx: { pl: 0 },
    },
    {
        id: "status",
        align: "right",
        label: "Trạng thái",
        sx: { pl: 0 },
    },
    {
        id: "progress",
        align: "right",
        label: "Tiến trình",
        sx: { pl: 0 },
    },
    {
        id: "actions",
        sx: { pl: 0 },
    },
];

export default function VideoTableHead(props) {
    const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
    const createSortHandler = (property) => (event) => {
        onRequestSort(event, property);
    };

    return (
        <TableHead>
            <TableRow>
                <TableCell padding="checkbox">
                    <Checkbox
                        color="primary"
                        checked={rowCount > 0 && numSelected === rowCount}
                        inputProps={{ "aria-label": "select all desserts" }}
                        indeterminate={numSelected > 0 && numSelected < rowCount}
                        onChange={({ target }) => onSelectAllClick(target.checked)}
                    />
                </TableCell>
                {headCells.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align={headCell.align}
                        padding={headCell.disablePadding ? "none" : "normal"}
                        sortDirection={orderBy === headCell.id ? order : false}
                        sx={{ minWidth: headCell.minWidth, whiteSpace: "nowrap", ...headCell.sx }}
                    >
                        {headCell.sortable ? (
                            <TableSortLabel
                                active={orderBy === headCell.id}
                                onClick={createSortHandler(headCell.id)}
                                direction={orderBy === headCell.id ? order : "asc"}
                            >
                                {headCell.label}
                                {orderBy === headCell.id ? (
                                    <Box component="span" sx={visuallyHidden}>
                                        {order === "desc" ? "sorted descending" : "sorted ascending"}
                                    </Box>
                                ) : null}
                            </TableSortLabel>
                        ) : (
                            headCell.label
                        )}
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}
