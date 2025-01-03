import { toast } from "sonner"
import { Fragment, useState, useTransition } from "react"
import { useFormContext, Controller } from "react-hook-form"
// @mui
import TextField from "@mui/material/TextField"
import Autocomplete from "@mui/material/Autocomplete"
import CircularProgress from "@mui/material/CircularProgress"
// actions
import { getLogos } from "@/actions/logo"
// hooks
import useDebounce from "@/hooks/useDebounce"

// ----------------------------------------------------------------------

export default function LogoSelect({ name, ...other }) {
  const { control } = useFormContext()
  const [options, setOptions] = useState([])
  const [pending, startTransition] = useTransition()

  const handleSearch = useDebounce((search) => {
    if (search && !pending) {
      startTransition(async () => {
        const result = await getLogos({ search, select: { id: true, name: true, file: { select: { path: true } } } })
        if (result.error) {
          toast.error(result.error.message)
        } else {
          setOptions(result.logoList)
        }
      })
    }
  }, 750)

  // useEffect(() => {
  //   const fetchStyles = () => {
  //     startTransition(async () => {
  //       const result = await getStyles({ select: { id: true, name: true } })
  //       if (!result.error && result.styleList.length > 0) setOptions(result.styleList)
  //     })
  //   }

  //   fetchStyles()
  // }, [])

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Autocomplete
          loading={pending}
          options={options}
          value={field?.value}
          noOptionsText="Không có logo nào"
          getOptionLabel={(option) => option.name}
          onChange={(_, value) => field.onChange({ target: { value } })}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              label="Logo"
              placeholder="Tìm kiếm logo"
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
