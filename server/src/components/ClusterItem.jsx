"use client"
import { toast } from "sonner"
import { useLayoutEffect, useState, useTransition } from "react"
// @mui
import Card from "@mui/material/Card"
import Badge from "@mui/material/Badge"
import Stack from "@mui/material/Stack"
import MenuItem from "@mui/material/MenuItem"
import { styled } from "@mui/material/styles"
import IconButton from "@mui/material/IconButton"
import Typography from "@mui/material/Typography"
// icons
import LockIcon from "@mui/icons-material/Lock"
import AppleIcon from "@mui/icons-material/Apple"
import WindowIcon from "@mui/icons-material/Window"
import MemoryIcon from "@mui/icons-material/Memory"
import MoreHorizIcon from "@mui/icons-material/MoreHoriz"
import QuestionMarkIcon from "@mui/icons-material/QuestionMark"
// components
import MenuPopover from "@/components/MenuPopover"
// actions
import { deleteCluster } from "@/actions/cluster"
import { formatDistanceToNow } from "@/libs/format"

export const osLogo = (platform, sx) => {
  if (platform === "darwin") return <AppleIcon sx={sx} />
  if (platform === "win32") return <WindowIcon sx={sx} />
  return <QuestionMarkIcon sx={sx} />
}

export const OsLogoStyled = styled("div")(({ theme }) => ({
  width: 44,
  height: 44,
  flexShrink: 0,
  borderRadius: "50%",
  alignItems: "center",
  display: "inline-flex",
  justifyContent: "center",
  border: `1px solid ${theme.palette.divider}`,
}))

const StyledBadge = styled(Badge)(({ theme, online }) => ({
  "& .MuiBadge-badge": {
    color: theme.palette[online ? "success" : "error"].main,
    backgroundColor: theme.palette[online ? "success" : "error"].main,
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      border: "1px solid currentColor",
      content: '""',
      ...(online && { animation: "ripple 1.2s infinite ease-in-out" }),
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}))

export default function ClusterItem({ cluster, mutate }) {
  const [open, setOpen] = useState(null)
  const [status, setStatus] = useState({ online: false, uptime: 0 })
  const [pending, startTransition] = useTransition()

  const handleClose = () => setOpen(null)
  const handleOpen = (event) => setOpen(event.currentTarget)

  const handleDeleteCluster = () =>
    startTransition(async () => {
      try {
        const result = await deleteCluster(cluster.id)
        if (result.error) throw new Error(result.error.message)

        mutate()
        toast.success("Đã xoá thành công 1 cluster")
      } catch (error) {
        console.log(error.message)
        toast.error(error.message)
      }
    })

  useLayoutEffect(() => {
    const getClusterStatus = async () => {
      try {
        const response = await fetch(`${cluster.host}:${cluster.port}/status`)
        const clusterStatus = await response.json()
        setStatus(clusterStatus)
      } catch (error) {
        setStatus({ ...status, online: false })
        console.log(error.message)
      }
    }

    getClusterStatus()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cluster])

  return (
    <Card sx={{ p: 3, pr: 2 }}>
      <Stack direction="row" spacing={1.5} alignItems="start">
        <StyledBadge
          variant="dot"
          overlap="circular"
          online={status.online}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <OsLogoStyled>{osLogo(cluster.platform, { width: 32, height: 32 })}</OsLogoStyled>
        </StyledBadge>
        <Stack sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography noWrap fontWeight="bold">
            {cluster.name}
          </Typography>
          <Typography variant="caption">{cluster.serial}</Typography>
        </Stack>

        <IconButton size="small" onClick={handleOpen}>
          <MoreHorizIcon />
        </IconButton>

        <MenuPopover
          anchorEl={open}
          open={Boolean(open)}
          onClose={handleClose}
          sx={{
            mt: 1.5,
            ml: 0.75,
            width: 180,
          }}
        >
          <Stack spacing={0.75}>
            <MenuItem sx={{ color: "error.main" }} onClick={handleDeleteCluster}>
              Xoá
            </MenuItem>
            <MenuItem>Đặt mật khẩu</MenuItem>
          </Stack>
        </MenuPopover>
      </Stack>

      <Stack mt={2} spacing={1}>
        <Typography variant="caption">Uptime: {formatDistanceToNow(status.uptime)}</Typography>
        <Stack direction="row" justifyContent="space-between">
          <Stack direction="row" minWidth={0} spacing={0.75} alignItems="center">
            <MemoryIcon sx={{ width: 20, height: 20 }} />
            <Typography noWrap>{cluster.processor}</Typography>
            <Typography noWrap minWidth="max-content">
              ffmpeg {cluster.ffmpeg}
            </Typography>
          </Stack>
          {cluster.password && <LockIcon sx={{ width: 20, height: 20 }} />}
        </Stack>
      </Stack>
    </Card>
  )
}
