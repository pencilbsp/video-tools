// @mui
import { visuallyHidden } from "@mui/utils"

import Box from "@mui/material/Box"
import TableRow from "@mui/material/TableRow"
import Checkbox from "@mui/material/Checkbox"
import TableCell from "@mui/material/TableCell"
import TableHead from "@mui/material/TableHead"
import TableSortLabel from "@mui/material/TableSortLabel"

// ----------------------------------------------------------------------

export default function VideoListTableHead({
  order,
  orderBy,
  rowCount,
  isLoading,
  headCells,
  numSelected,
  onRequestSort,
  onSelectAllClick,
}) {
  const createSortHandler =
    (orderBy) =>
    ({ target }) =>
      onRequestSort({ order: target.value, orderBy })

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            disabled={isLoading}
            checked={rowCount > 0 && numSelected === rowCount}
            inputProps={{ "aria-label": "select all desserts" }}
            indeterminate={numSelected > 0 && numSelected < rowCount}
            onChange={({ target }) => onSelectAllClick(target.checked)}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? "right" : "left"}
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
  )
}
