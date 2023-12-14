import { toast } from "sonner"
import Image from "next/image"
import { useTransition } from "react"
// @mui
import Stack from "@mui/material/Stack"
import Tooltip from "@mui/material/Tooltip"
import { styled } from "@mui/material/styles"
import Checkbox from "@mui/material/Checkbox"
import TableRow from "@mui/material/TableRow"
import TableCell from "@mui/material/TableCell"
import Typography from "@mui/material/Typography"
import IconButton from "@mui/material/IconButton"
// icons
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt"
// actions
import { getStyle } from "@/actions/style"
// libs
import { formatDate, formatDistanceToNow } from "@/libs/format"
// icons
import AesibsubLogo from "@/assets/Aegisub.png"

// ----------------------------------------------------------------------

const TableCellStyled = styled(TableCell)({ paddingTop: 4, paddingBottom: 4, whiteSpace: "nowrap" })

export default function StyleTableRow(props) {
  const [pending, startTransition] = useTransition()
  const { isSelected, onSelect, row, labelId, onOpenEdit } = props

  const handleEditStyke = () =>
    startTransition(async () => {
      const result = await getStyle(row.id)
      console.log(result)
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
      <TableCellStyled component="th" width={360} id={labelId} scope="row">
        <Stack direction="row" alignItems="center" spacing={1}>
          <Image src={AesibsubLogo} alt="Aesibsub Logo" width={18} />
          <Typography>{row.name}</Typography>
        </Stack>
      </TableCellStyled>
      <TableCellStyled align="right">{formatDate(row.createdAt)}</TableCellStyled>
      <TableCellStyled align="right">{formatDistanceToNow(row.updatedAt)}</TableCellStyled>
      <TableCellStyled align="right">
        <Tooltip title="Cập nhật style">
          <IconButton onClick={handleEditStyke} disabled={pending}>
            <SystemUpdateAltIcon sx={{ width: 18, height: 18 }} />
          </IconButton>
        </Tooltip>
      </TableCellStyled>
    </TableRow>
  )
}
