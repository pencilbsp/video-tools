"use client"
import { m } from "framer-motion"
import { forwardRef } from "react"
// @mui
import Card from "@mui/material/Card"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
// icons
import LockIcon from "@mui/icons-material/Lock"
import MemoryIcon from "@mui/icons-material/Memory"
//
import { OsLogoStyled, osLogo } from "./ClusterItem"

const ClusterSelectItem = forwardRef(({ cluster, value, onChange, onVerify }, ref) => {
  const selected = value?.id === cluster.id
  const handleSelect = () => {
    if (selected) return onChange({ target: { value: null } })

    if (cluster.password) {
      onVerify(cluster.id, onChange)
    } else {
      onChange({ target: { value: cluster } })
    }
  }

  return (
    <Card
      ref={ref}
      whileTap="tap"
      component={m.div}
      onClick={handleSelect}
      variants={{ tap: { scale: 0.98 } }}
      sx={{
        p: 3,
        pr: 2,
        width: 1,
        border: 2,
        cursor: "pointer",
        "&:hover": { bgcolor: "background.default" },
        borderColor: (theme) => (selected ? theme.palette.primary.light : theme.palette.grey[200]),
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="start">
        <OsLogoStyled>{osLogo(cluster.platform, { width: 32, height: 32 })}</OsLogoStyled>
        <Stack sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography noWrap fontWeight="bold">
            {cluster.name}
          </Typography>
          <Typography variant="caption">{cluster.serial}</Typography>
        </Stack>
      </Stack>
      <Stack mt={3} direction="row" justifyContent="space-between">
        <Typography sx={{ display: "flex", alignItems: "center" }}>
          <MemoryIcon sx={{ width: 20, height: 20, mr: 0.75 }} />
          {cluster.processor} | ffmpeg {cluster.ffmpeg}
        </Typography>
        {cluster.password && <LockIcon sx={{ width: 20, height: 20 }} />}
      </Stack>
    </Card>
  )
})

ClusterSelectItem.displayName = "ClusterSelectItem"

export default ClusterSelectItem
