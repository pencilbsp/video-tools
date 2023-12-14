import * as yup from "yup"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { useCallback, useEffect, useId, useMemo, useState, useTransition } from "react"
// @mui
import Stack from "@mui/material/Stack"
import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import LoadingButton from "@mui/lab/LoadingButton"
import DialogTitle from "@mui/material/DialogTitle"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
// hooks
import useResponsive from "@/hooks/useResponsive"
// components
import { FormProvider, RHFSelect, RHFTextField, RHFUploadSubtitle } from "@/components/HookForm"
// redux
import { getStyles, useDispatch } from "@/libs/redux"
// actions
import { formatData } from "@/libs/format"
import { MAX_SUBTITLE_SIZE } from "@/libs/configs"
import { parseAssSubtitle } from "@/libs/subtitle"

// ----------------------------------------------------------------------

const schema = yup.object().shape({
  name: yup.string().required("Vui lòng đặt tên cho style"),
  file: yup.mixed().required("Vui lòng chọn tệp tin phụ đề .ass"),
  options: yup.object().shape({
    mainStyle: yup.string().required("Vui lòng chọn tên style chính"),
  }),
})

const parseStyles = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader()

    reader.onload = function (e) {
      const fileContent = e.target.result
      const data = parseAssSubtitle(fileContent)
      return resolve(data.styles.map(({ Name }) => Name))
    }

    reader.readAsText(file)
  })
}

export default function StyleForm(props) {
  const { open, style: currentStyle, onClose } = props
  const isEdit = !!currentStyle

  const defaultValues = useMemo(
    () => ({
      name: currentStyle?.name ?? "",
      file: currentStyle?.file ?? null,
      options: currentStyle?.options ?? {
        mainStyle: "",
      },
    }),
    [currentStyle]
  )

  const formId = useId()
  const dispatch = useDispatch()
  const isMobile = useResponsive("down", "sm")
  const [isPending, startTransition] = useTransition()
  const [styles, setStyle] = useState(currentStyle?.options?.styles ?? [])
  const methods = useForm({ defaultValues, resolver: yupResolver(schema) })

  const { handleSubmit, reset, setValue, formState } = methods

  const onSubmit = (data) => {
    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append("type", "style")
        formData.append("name", data.name)
        formData.append("file", data.file)
        formData.append("options", JSON.stringify({ ...data.options, styles }))
        isEdit && formData.append("id", currentStyle.id)

        const response = await fetch("/api/upload/subtitle", {
          method: "POST",
          body: formData,
        })

        const result = await response.json()
        if (!response.ok) throw new Error(result.error.message)

        if (isEdit) {
          if (result.update) {
            toast.success("Đã cập nhật style thành công")
            dispatch(getStyles())
            reset(defaultValues)
            onClose()
          } else {
            toast.warning("Style không có thay đổi nào")
          }
        } else {
          if (result.double) {
            toast.warning("Tệp tin style đã bị trùng lặp")
          } else {
            toast.success("Style mới đã được thêm thành công")
            dispatch(getStyles())
            reset(defaultValues)
            onClose()
          }
        }
      } catch (error) {
        toast.error(error.message)
      }
    })
  }

  const handleDrop = useCallback(
    async (files) => {
      const file = files[0]
      if (file) {
        try {
          const styleList = await parseStyles(file)
          setStyle(styleList)
          setValue("file", file)
        } catch (error) {
          toast.error(error.message || "Xảy ra lỗi khi phân tích cú pháp style")
        }
      }
    },
    [setValue]
  )

  useEffect(() => {
    reset(defaultValues)
    if (currentStyle) setStyle(currentStyle.options?.styles)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStyle])

  return (
    <Dialog open={open} maxWidth="xs" fullScreen={isMobile}>
      <DialogTitle variant="h6">{isEdit ? "Cập nhật style" : "Tạo style mới"}</DialogTitle>
      <DialogContent>
        <FormProvider id={formId} methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            <RHFTextField name="name" size="small" label="Tên" placeholder="Tên style" />

            <RHFUploadSubtitle
              name="file"
              onDelete={() => {
                setStyle([])
                setValue("options.mainStyle", "")
              }}
              onDrop={handleDrop}
              maxSize={MAX_SUBTITLE_SIZE}
              accept={{ "text/ass": [".ass"] }}
              placeholder="Chọn hoặc kéo thả tệp tin style"
              helperText={`Chấp tệp tin phụ đề *.ass. Kích thước tối đa ${formatData(MAX_SUBTITLE_SIZE)}`}
            />

            {styles.length > 0 && (
              <RHFSelect name="options.mainStyle" size="small" label="Chọn style">
                {styles.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </RHFSelect>
            )}
          </Stack>{" "}
        </FormProvider>
      </DialogContent>
      <DialogActions>
        <LoadingButton
          form={formId}
          type="submit"
          variant="outlined"
          loading={isPending}
          disabled={isPending || !formState.isDirty}
        >
          {isEdit ? "Lưu" : "Tạo"}
        </LoadingButton>
        <Button variant="outlined" color="error" onClick={onClose} disabled={isPending}>
          Thoát
        </Button>
      </DialogActions>
    </Dialog>
  )
}
