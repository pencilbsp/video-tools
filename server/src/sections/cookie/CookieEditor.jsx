import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { useEffect, useId, useMemo, useTransition } from "react"
// @mui
import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import LoadingButton from "@mui/lab/LoadingButton"
import DialogTitle from "@mui/material/DialogTitle"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
// hooks
import useResponsive from "@/hooks/useResponsive"
// components
import { RHFCookieEditor, FormProvider, RHFTextField } from "@/components/HookForm"
// redux
import { useDispatch, getCookies, videoParserSlice } from "@/libs/redux"
// actions
import { cookieSchema } from "@/libs/validate"
import { createCookie } from "@/actions/cookie"

// ----------------------------------------------------------------------

function checkError(errors) {
  if (!(errors instanceof Object)) return false
  let isError = false
  for (const key of Object.keys(errors)) {
    if (errors[key].message) {
      isError = true
      break
    }
  }

  return isError
}

export default function CookieEditor(props) {
  const { open, cookie: currentCookie, onClose } = props

  const defaultValues = useMemo(
    () => ({
      name: currentCookie?.name || "Cookie mới",
      cookie: currentCookie?.values ? JSON.stringify(currentCookie.values) : "",
    }),
    [currentCookie]
  )

  const formId = useId()
  const dispatch = useDispatch()
  const isMobile = useResponsive("down", "md")
  const [isPending, startTransition] = useTransition()
  const methods = useForm({ defaultValues, resolver: yupResolver(cookieSchema) })

  const { handleSubmit, reset, formState } = methods

  const onSubmit = (data) => {
    startTransition(async () => {
      try {
        const cookie = JSON.parse(data.cookie)

        const result = await createCookie({ ...data, cookie, id: currentCookie?.id })
        if (result.error) throw new Error(result.error.message)

        dispatch(getCookies())
        if (currentCookie) {
          toast.success("Đã cập nhật cookie thàng công")
        } else {
          toast.success("Cookie mới đã được thêm thành công")
          dispatch(videoParserSlice.actions.updateCookie({ mode: "add", cookie: result }))
        }
        reset(defaultValues)
        onClose()
      } catch (error) {
        // console.log(error)
        toast.error(error.message)
      }
    })
  }

  useEffect(() => {
    reset(defaultValues)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCookie])

  return (
    <FormProvider id={formId} methods={methods} onSubmit={handleSubmit(onSubmit)} sx={{ height: 1 }}>
      <Dialog open={open} maxWidth="md" fullScreen={isMobile} sx={{ "& .MuiPaper-root": { height: 1 } }}>
        <DialogTitle>
          <RHFTextField
            sx={{ ".MuiInputBase-root": { borderRadius: 0 } }}
            placeholder="Đặt tên cho cookie"
            name="name"
            size="small"
          />
        </DialogTitle>
        <DialogContent sx={{ overflow: "hidden", "> section": { border: 1, borderColor: "divider" } }}>
          <RHFCookieEditor
            name="cookie"
            language="json"
            options={{
              wordWrap: "on",
              scrollBeyondLastLine: false,
              minimap: {
                enabled: false,
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <LoadingButton
            type="submit"
            form={formId}
            variant="outlined"
            loading={isPending}
            disabled={isPending || !formState.isDirty || checkError(formState.errors)}
          >
            {!!currentCookie ? "Lưu" : "Thêm"}
          </LoadingButton>
          <Button variant="outlined" color="error" onClick={onClose} disabled={isPending}>
            Thoát
          </Button>
        </DialogActions>
      </Dialog>
    </FormProvider>
  )
}
