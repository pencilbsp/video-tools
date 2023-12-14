import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { useEffect, useId, useMemo, useTransition } from "react"
// @mui
import { LoadingButton } from "@mui/lab"
import { Dialog, Button, DialogContent, DialogActions, Alert } from "@mui/material"
// hooks
import useResponsive from "@/hooks/useResponsive"
// configs
import { defaultVideoOptions } from "@/libs/configs"
import { mergeOptions, videoSchema } from "@/libs/validate"
// components
import { updateVideo } from "@/actions/video"
import { FormProvider } from "@/components/HookForm"
import VideoOptionsForm from "@/components/VideoOptionsForm"

export default function VideoOptions(props) {
  const { open, video, onClose } = props

  const formId = useId()
  const [pending, startTransition] = useTransition()
  const defaultValues = useMemo(() => (video ? mergeOptions({ ...video }) : defaultVideoOptions), [video])

  const isMobile = useResponsive("down", "sm")
  const methods = useForm({
    defaultValues,
    resolver: yupResolver(videoSchema),
  })

  const { reset, setValue, handleSubmit, formState, getValues } = methods

  const handleUploadSubtitle = (files) =>
    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append("file", files[0])

        const response = await fetch("/api/upload/subtitle", {
          method: "POST",
          body: formData,
        })

        const result = await response.json()
        if (!response.ok) throw new Error(result.error.message)

        setValue("subtitle", result.subtitle)
        toast.success("Phụ đề đã được tải lên thành công")
      } catch (error) {
        setValue("subtitle", null)
        toast.error(error.message)
      }
    })

  const handleUpdateVideo = (data) =>
    startTransition(async () => {
      try {
        const result = await updateVideo(video.id, data)
        if (result.error) throw new Error(result.error.message)

        reset(getValues())
        toast.success("Video đã được cập nhật thành công")
        onClose()
      } catch (error) {
        toast.error(error.message)
      }
    })

  useEffect(() => {
    if (video) reset(defaultValues)
    else reset(defaultVideoOptions)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video])

  if (!video) return null

  return (
    <Dialog open={open} maxWidth="xs" fullScreen={isMobile} scroll="body">
      <FormProvider methods={methods} onSubmit={handleSubmit(handleUpdateVideo)} id={formId}>
        <DialogContent>
          {video.message && <Alert severity="error">{video.message}</Alert>}
          <VideoOptionsForm
            methods={methods}
            status={video.status}
            cookies={video.cookies}
            onDrop={handleUploadSubtitle}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="error" onClick={onClose} disabled={pending}>
            Thoát
          </Button>
          <LoadingButton
            type="submit"
            form={formId}
            variant="outlined"
            disabled={pending || (video?.status !== "error" && !formState.isDirty)}
          >
            {video?.status === "error" ? "Thử lại" : "Lưu"}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  )
}
