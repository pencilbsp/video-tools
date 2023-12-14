import { useCallback } from "react"
// @mui
import { FormHelperText, Stack } from "@mui/material"
// components
import { UploadLogo, UploadSubtitle } from "../Upload"
// form
import { Controller, useFormContext } from "react-hook-form"

// ----------------------------------------------------------------------

export function RHFUploadLogo({ name, ...other }) {
  const { control } = useFormContext()

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const checkError = !!error && !field.value

        return (
          <Stack spacing={1.5}>
            <UploadLogo
              error={checkError}
              file={field.value?.file ?? field.value}
              onDrop={(value) => field.onChange({ target: { value } })}
              onDelete={() => field.onChange({ target: { value: null } })}
              {...other}
            />
            {checkError && (
              <FormHelperText error sx={{ px: 2, textAlign: "center" }}>
                {error.message}
              </FormHelperText>
            )}
          </Stack>
        )
      }}
    />
  )
}

export function RHFUploadSubtitle({ name, onDrop, onDelete, ...other }) {
  const { control } = useFormContext()

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const checkError = !!error && !field.value

        return (
          <Stack spacing={0.5}>
            <UploadSubtitle
              error={checkError}
              file={field.value?.file ?? field.value}
              onDrop={(files) => {
                field.onChange({ target: { value: files[0] } })
                onDrop(files)
              }}
              onDelete={() => {
                field.onChange({ target: { value: null } })
                onDelete()
              }}
              {...other}
            />
            {checkError && (
              <FormHelperText error sx={{ px: 2 }}>
                {error.message}
              </FormHelperText>
            )}
          </Stack>
        )
      }}
    />
  )
}
