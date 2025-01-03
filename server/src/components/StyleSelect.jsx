import { toast } from "sonner"
import { Fragment, useState, useTransition } from "react"
import { useFormContext, Controller } from "react-hook-form"
// @mui
import TextField from "@mui/material/TextField"
import Autocomplete from "@mui/material/Autocomplete"
import CircularProgress from "@mui/material/CircularProgress"
// actions
import { getStyles } from "@/actions/style"
// hooks
import useDebounce from "@/hooks/useDebounce"

// ----------------------------------------------------------------------

export default function StyleSelect({ name, ...other }) {
  const { control } = useFormContext()
  const [options, setOptions] = useState([])
  const [pending, startTransition] = useTransition()

  const handleSearch = useDebounce((search) => {
    if (search && !pending) {
      startTransition(async () => {
        const result = await getStyles({ search, select: { id: true, name: true } })
        if (result.error) {
          toast.error(result.error.message)
        } else {
          setOptions(result.styleList)
        }
      })
    }
  }, 750)

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Autocomplete
          loading={pending}
          options={options}
          // disableClearable
          value={field?.value}
          noOptionsText="Không có style nào"
          getOptionLabel={(option) => option.name}
          onChange={(_, value) => field.onChange({ target: { value } })}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              label="Style phụ đề"
              placeholder="Tìm kiếm style cho phụ đề"
              onChange={({ target }) => handleSearch(target.value)}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <Fragment>
                    {pending ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </Fragment>
                ),
              }}
            />
          )}
          {...other}
        />
      )}
    />
  )
}
