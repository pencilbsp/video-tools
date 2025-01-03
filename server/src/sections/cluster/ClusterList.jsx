"use client"
import Stack from "@mui/material/Stack"
import Grid from "@mui/material/Unstable_Grid2/Grid2"
// components
import ClusterItem from "@/components/ClusterItem"
//
import CreateCluster from "./CreateCluster"
import useClusterList from "@/hooks/useClusterList"

export default function ClusterList() {
  const { clusterList, mutate } = useClusterList()

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="end">
        <CreateCluster mutate={mutate} />
      </Stack>
      <Grid container spacing={2} columns={{ xs: 6, md: 12 }}>
        {clusterList.map((cluster) => (
          <Grid key={cluster.id} xs={6}>
            <ClusterItem mutate={mutate} cluster={cluster} />
          </Grid>
        ))}
      </Grid>
    </Stack>
  )
}
