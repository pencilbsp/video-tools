// sections
// @mui
import VideoTable from "@/sections/video/VideoTable"
import { Stack, Typography } from "@mui/material"

export default async function VideoPage() {
  return (
    <Stack spacing={3}>
      <Typography component="h1" variant="h4">
        Quản lý Video
      </Typography>

      <VideoTable />
    </Stack>
  )
}
