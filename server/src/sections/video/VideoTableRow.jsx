import { toast } from "sonner"
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
import MovieOutlinedIcon from "@mui/icons-material/MovieOutlined"
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined"
// actions
import { getVideo } from "@/actions/video"
// hooks
import { editableStatus } from "@/hooks/useVideoList"
import useVideoSubscription from "@/hooks/useVideoSubscription"
// libs
import { formatDistanceToNow } from "@/libs/format"
// components
import Label from "@/components/Label"
import LinearProgressWithLabel from "@/components/LinearProgressWithLabel"
//
import VideoActions from "./VideoActions"

// ----------------------------------------------------------------------

function getLabelColor(status) {
  if (status === "error") return status
  if (["pending"].includes(status)) return "primary"
  if (["encoding", "downloading", "uploading"].includes(status)) return "warning"
  if (["downloaded", "done"].includes(status)) return "success"
  return "info"
}

const TableCellStyled = styled(TableCell)({ paddingTop: 8, paddingBottom: 8, whiteSpace: "nowrap", paddingLeft: 0 })

export default function VideoTableRow(props) {
  const { isSelected, row, labelId, onOpenEdit, onSelect } = props
  const editable = editableStatus.includes(row.status)

  const [pending, startTransition] = useTransition()
  const status = useVideoSubscription(row.clusterId, row.id, row.status)

  const handleGetVideo = () =>
    startTransition(async () => {
      const result = await getVideo(row.id)
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
      <TableCellStyled padding="checkbox" sx={{ pl: 0.5 }}>
        <Checkbox
          color="primary"
          disabled={!editable}
          checked={isSelected}
          onChange={() => onSelect(row.id)}
          inputProps={{ "aria-labelledby": labelId }}
        />
      </TableCellStyled>
      <TableCellStyled component="th" width={380} sx={{ maxWidth: 380 }} id={labelId} scope="row">
        <Stack direction="row" alignItems="center" spacing={1}>
          <MovieOutlinedIcon sx={{ width: 18, height: 18 }} />
          <Typography noWrap>{row.name}</Typography>
        </Stack>
      </TableCellStyled>
      <TableCellStyled align="right">{formatDistanceToNow(row.createdAt)}</TableCellStyled>
      <TableCellStyled align="right">
        <Label variant="outlined" color={getLabelColor(row.status)} sx={{ textTransform: "capitalize" }}>
          {row.status}
        </Label>
      </TableCellStyled>
      <TableCellStyled align="right" sx={{ pl: 0 }} width={150}>
        <LinearProgressWithLabel variant="determinate" {...status} />
      </TableCellStyled>
      <TableCellStyled align="right" sx={{ pl: 0 }}>
        {row.supportActions && <VideoActions status={row.status} id={row.id} />}

        {editable && (
          <Tooltip title="Tuỳ chỉnh video">
            <span>
              <IconButton onClick={handleGetVideo} disabled={pending}>
                <SettingsOutlinedIcon sx={{ width: 18, height: 18 }} />
              </IconButton>
            </span>
          </Tooltip>
        )}
      </TableCellStyled>
    </TableRow>
  )
}
