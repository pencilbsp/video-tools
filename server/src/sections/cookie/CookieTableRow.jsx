import { toast } from "sonner"
import { useTransition } from "react"
// @mui
import Stack from "@mui/material/Stack"
import Tooltip from "@mui/material/Tooltip"
import Checkbox from "@mui/material/Checkbox"
import { styled } from "@mui/material/styles"
import TableRow from "@mui/material/TableRow"
import TableCell from "@mui/material/TableCell"
import IconButton from "@mui/material/IconButton"
import Typography from "@mui/material/Typography"
// icons
import CookieOutlinedIcon from "@mui/icons-material/CookieOutlined"
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt"
// libs
import { formatDate, formatDistanceToNow } from "@/libs/format"
import { getCookie } from "@/actions/cookie"

// ----------------------------------------------------------------------

const TableCellStyled = styled(TableCell)({ paddingTop: 4, paddingBottom: 4, whiteSpace: "nowrap" })

export default function CookieTableRow(props) {
  const [pending, startTransition] = useTransition()
  const { isSelected, onSelect, row, labelId, onOpenEdit } = props

  const handleEditCookie = () =>
    startTransition(async () => {
      const result = await getCookie(row.id)
      if (result.error) toast.error(result.error.message)
      else onOpenEdit(result)
    })

  return (
    <TableRow
      hover
      tabIndex={-1}
      role="checkbox"
      selected={isSelected}
      aria-checked={isSelected}
      sx={{ cursor: "pointer" }}
    >
      <TableCellStyled padding="checkbox">
        <Checkbox
          color="primary"
          checked={isSelected}
          onChange={() => onSelect(null, row.id)}
          inputProps={{ "aria-labelledby": labelId }}
        />
      </TableCellStyled>
      <TableCellStyled sx={{ paddingRight: 0 }} component="th" id={labelId} scope="row">
        <Stack direction="row" alignItems="center" spacing={1}>
          <CookieOutlinedIcon sx={{ width: 18, height: 18 }} />
          <Typography>{row.name}</Typography>
        </Stack>
      </TableCellStyled>
      <TableCellStyled align="right">{row.site}</TableCellStyled>
      <TableCellStyled align="right">{formatDate(row.createdAt)}</TableCellStyled>
      <TableCellStyled align="right">{formatDistanceToNow(row.updatedAt)}</TableCellStyled>
      <TableCellStyled align="right">
        <Tooltip title="Cập nhật cookie">
          <IconButton onClick={handleEditCookie} disabled={pending}>
            <SystemUpdateAltIcon sx={{ width: 18, height: 18 }} />
          </IconButton>
        </Tooltip>
      </TableCellStyled>
    </TableRow>
  )
}
