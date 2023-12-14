"use client"

import { toast } from "sonner"
import isString from "lodash/isString"
import { useDropzone } from "react-dropzone"
import { useCallback, useTransition } from "react"
// @mui
import { styled } from "@mui/material/styles"
import { Button, CircularProgress, Stack, Typography } from "@mui/material"
//
import Image from "../Image"
import RejectionFiles from "./RejectionFiles"

// icons
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate"

// ----------------------------------------------------------------------

const RootStyle = styled("div")(({ theme }) => ({
  width: 80,
  height: 80,
  padding: theme.spacing(0.5),
  borderRadius: theme.shape.borderRadius,
  border: `1px dashed ${theme.palette.grey[500]}`,
}))

const DropZoneStyle = styled("div")(({ theme }) => ({
  zIndex: 0,
  width: "100%",
  height: "100%",
  outline: "none",
  display: "flex",
  overflow: "hidden",
  borderRadius: theme.shape.borderRadius - 4,
  position: "relative",
  alignItems: "center",
  justifyContent: "center",
  "& > *": { width: "100%", height: "100%" },
  "&:hover": {
    cursor: "pointer",
    "& .placeholder": {
      zIndex: 9,
    },
  },
}))

const PlaceholderStyle = styled("div")(({ theme }) => ({
  display: "flex",
  position: "absolute",
  alignItems: "center",
  flexDirection: "column",
  justifyContent: "center",
  color: theme.palette.text.secondary,
  backgroundColor: theme.palette.background.neutral,
  transition: theme.transitions.create("opacity", {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter,
  }),
  "&:hover": { opacity: 0.72 },
}))

// ----------------------------------------------------------------------

export default function UploadLogo({ error, file, helperText, sx, onDelete, onDrop, ...other }) {
  const [isPending, startTransition] = useTransition()

  const handleUploadLogo = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0]
      if (file)
        startTransition(async () => {
          const formData = new FormData()
          formData.append("file", file)

          const response = await fetch("/api/upload/logo", { method: "POST", body: formData })

          const data = await response.json()
          if (!response.ok || !data?.logo) return toast.error(data.error.message)

          onDrop && onDrop(data.logo)
        })
    },
    [onDrop]
  )

  const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections } = useDropzone({
    onDrop: handleUploadLogo,
    multiple: false,
    ...other,
  })

  return (
    <>
      <Stack spacing={2} direction="row">
        <RootStyle
          sx={{
            ...((isDragReject || error) && {
              borderColor: "error.light",
            }),
            ...sx,
          }}
        >
          <DropZoneStyle
            {...getRootProps()}
            sx={{
              ...(isDragActive && { opacity: 0.72 }),
            }}
          >
            <input {...getInputProps()} disabled={isPending} />

            {file && <Image alt="avatar" src={file.path} sx={{ zIndex: 8 }} />}

            <PlaceholderStyle
              className="placeholder"
              sx={{
                ...(file && {
                  opacity: 0,
                  color: "common.white",
                  bgcolor: "grey.900",
                  "&:hover": { opacity: 0.72 },
                }),
                ...((isDragReject || error) && {
                  bgcolor: "error.lighter",
                }),
              }}
            >
              {isPending ? (
                <CircularProgress />
              ) : (
                <>
                  <AddPhotoAlternateIcon sx={{ width: 24, height: 24, mb: 1 }} />
                  <Typography variant="caption">{file ? "Sửa logo" : "Thêm logo"}</Typography>
                </>
              )}
            </PlaceholderStyle>
          </DropZoneStyle>
        </RootStyle>

        {file && (
          <Stack flex={1} spacing={1} direction="row" alignItems="flex-end" justifyContent="end">
            <Button size="small" variant="outlined" disabled={isPending}>
              Chỉnh sửa logo
            </Button>
            <Button size="small" color="error" variant="outlined" onClick={onDelete} disabled={isPending}>
              Xoá
            </Button>
          </Stack>
        )}
      </Stack>

      {helperText && helperText}

      {fileRejections.length > 0 && <RejectionFiles fileRejections={fileRejections} />}
    </>
  )
}
