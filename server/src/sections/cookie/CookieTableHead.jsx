// @mui
import Box from "@mui/material/Box"
import { visuallyHidden } from "@mui/utils"
import Checkbox from "@mui/material/Checkbox"
import TableRow from "@mui/material/TableRow"
import TableCell from "@mui/material/TableCell"
import TableHead from "@mui/material/TableHead"
import TableSortLabel from "@mui/material/TableSortLabel"

// ----------------------------------------------------------------------

const headCells = [
  {
    id: "name",
    label: "Tên",
    minWidth: 300,
  },
  {
    id: "site",
    numeric: true,
    label: "Trang",
  },
  {
    id: "createdAt",
    numeric: true,
    label: "Ngày thêm",
  },
  {
    id: "updatedAt",
    numeric: true,
    label: "Sửa đổi lần cuối",
  },
  {
    id: "actions",
  },
]

export default function CookieTableHead(props) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property)
  }

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              "aria-label": "select all desserts",
            }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? "right" : "left"}
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{ minWidth: headCell.minWidth, whiteSpace: "nowrap" }}
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
  )
}
