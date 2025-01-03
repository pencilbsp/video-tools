// @mui
import { Stack, Typography } from "@mui/material"
// sections
import ClusterList from "@/sections/cluster/ClusterList"

export default async function ClusterPage(props) {
  return (
    <Stack spacing={3}>
      <Typography component="h1" variant="h4">
        Quản lý Cluster
      </Typography>

      <ClusterList />
    </Stack>
  )
}
