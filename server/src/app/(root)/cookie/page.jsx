// sections
import CookieTable from "@/sections/cookie/CookieTable"
// @mui
import { Stack, Typography } from "@mui/material"

export default async function CookiePage() {
  return (
    <Stack spacing={3}>
      <Typography component="h1" variant="h4">
        Quản lý Cookie
      </Typography>
      <CookieTable />
    </Stack>
  )
}
