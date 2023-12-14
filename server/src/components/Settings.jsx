"use client"

import { Button, Tooltip, styled } from "@mui/material"
import { Settings as SettingsIcon } from "@mui/icons-material"

const ButtonStyled = styled(Button)(({ theme }) => ({
  width: 34,
  height: 34,
  padding: 8,
  minWidth: "auto",
  boxShadow: theme.shadows[1],
}))

export default function Settings() {
  return (
    <>
      <Tooltip title="Mở cài đặt">
        <ButtonStyled variant="outlined">
          <SettingsIcon sx={{ width: 20, height: 20 }} />
        </ButtonStyled>
      </Tooltip>
    </>
  )
}
