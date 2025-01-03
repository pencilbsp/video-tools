"use client"

import NextImage from "next/image"
import { useDropzone } from "react-dropzone"
// @mui
import { styled } from "@mui/material/styles"
import { IconButton, Stack, Typography } from "@mui/material"
// icons
import AegisubLogo from "@/assets/Aegisub.png"
import CloseIcon from "@mui/icons-material/Close"
// libs
import { formatData } from "@/libs/format"

const RootStyle = styled(Stack)(({ theme }) => ({
  overflow: "hidden",
  border: "1px dashed",
  position: "relative",
  borderColor: theme.palette.grey[500],
  borderRadius: theme.shape.borderRadius,
}))

const DropZoneStyle = styled("div")({
  width: "100%",
  height: "100%",
  display: "flex",
  "&:hover": {
    cursor: "pointer",
    "& .placeholder": {
      zIndex: 9,
    },
  },
})

const PlaceholderStyle = styled("div")(({ theme }) => ({
  width: "100%",
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(1.5, 2),
  columnGap: theme.spacing(1.5),
  color: theme.palette.text.secondary,
  backgroundColor: theme.palette.background.neutral,
  transition: theme.transitions.create("opacity", {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter,
  }),
  "&:hover": { opacity: 0.7 },
}))

export default function UploadSubtitle({
  file,
  error,
  onDelete,
  helperText,
  placeholder = "Chọn hoặc kéo thả tệp tin phụ đề",
  ...other
}) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    ...other,
  })

  return (
    <>
      <RootStyle justifyContent="center" sx={error && { borderColor: "error.main" }}>
        <DropZoneStyle
          {...getRootProps()}
          sx={{
            ...(isDragActive && { opacity: 0.72 }),
          }}
        >
          <input {...getInputProps()} />
          <PlaceholderStyle>
            <NextImage src={AegisubLogo} width={36} alt="Aegisub Logo" style={!file && { filter: "grayscale(100%)" }} />
            <Stack>
              <Typography>{file?.name || placeholder}</Typography>
              <Typography variant="caption">
                {file?.size ? `Dung lượng: ${formatData(file.size)}` : helperText}
              </Typography>
            </Stack>
          </PlaceholderStyle>
        </DropZoneStyle>

        {file && (
          <IconButton size="small" sx={{ position: "absolute", right: 8, zIndex: 10 }} onClick={onDelete}>
            <CloseIcon sx={{ width: 18, height: 18 }} />
          </IconButton>
        )}
      </RootStyle>
    </>
  )
}
