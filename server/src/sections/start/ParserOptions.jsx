"use client"

import { useForm } from "react-hook-form"
import { Fragment, useEffect, useId, useState } from "react"
// @mui
import Stack from "@mui/material/Stack"
import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"
// components
import { FormProvider, RHFSelect, RHFSwitch, RHFTextField } from "@/components/HookForm"
// icons
import SettingsIcon from "@mui/icons-material/Settings"
// hooks
import useResponsive from "@/hooks/useResponsive"
// redux
import { selectVideoParser, useDispatch, useSelector, videoParserSlice } from "@/libs/redux"
//

// ----------------------------------------------------------------------

export default function ParserOptions() {
  const formId = useId()
  const dispatch = useDispatch()
  const [open, setOpen] = useState(false)
  const isMobile = useResponsive("down", "sm")
  const { options, status } = useSelector(selectVideoParser)

  const handleClose = () => setOpen(false)
  const handleClickOpen = () => setOpen(true)

  const methods = useForm({ defaultValues: options })

  const { reset, handleSubmit, formState } = methods

  const applyOptions = (data) => {
    dispatch(videoParserSlice.actions.changeParserOptions({ ...data, skip: Number(data.skip) }))
    handleClose()
  }

  useEffect(() => {
    reset(options)
    // Fixed: Uncaught (in promise) TypeError: Cannot assign to read only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options])

  return (
    <Fragment>
      <Button
        variant="contained"
        onClick={handleClickOpen}
        startIcon={<SettingsIcon />}
        disabled={status === "loading"}
        sx={{ height: 40, "& span": { marginRight: isMobile ? 0 : 1 } }}
      >
        {!isMobile && "Tuỳ chỉnh"}
      </Button>
      <Dialog open={open} fullScreen={isMobile} maxWidth="xs">
        <FormProvider methods={methods} id={formId} onSubmit={handleSubmit(applyOptions)}>
          <DialogTitle>Tuỷ chỉnh phân tích</DialogTitle>
          <DialogContent>
            <Stack spacing={3}>
              <RHFTextField size="small" name="skip" label="Số tập bỏ qua" type="number" />

              <RHFSelect size="small" name="order" label="Sắp xếp video">
                <option value="desc">Mới nhất</option>
                <option value="asc">Cũ nhất</option>
              </RHFSelect>

              <RHFSwitch name="withTrailer" labelPlacement="start" label="Hiện thị các tập trailer" />
              <RHFSwitch name="withVip" labelPlacement="start" label="Hiện thị các tập yêu cầu Vip" />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button type="submit" variant="outlined" disabled={!formState.isDirty}>
              Lưu
            </Button>
            <Button variant="outlined" color="error" onClick={handleClose} autoFocus>
              Thoát
            </Button>
          </DialogActions>
        </FormProvider>
      </Dialog>
    </Fragment>
  )
}
