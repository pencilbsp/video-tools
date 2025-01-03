import PropTypes from "prop-types";
// form
import { useFormContext, Controller } from "react-hook-form";
// @mui
import { TextField } from "@mui/material";

// ----------------------------------------------------------------------

RHFSelect.propTypes = {
    children: PropTypes.node,
    name: PropTypes.string,
};

export default function RHFSelect({ name, children, onChange, ...other }) {
    const { control } = useFormContext();

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState: { error } }) => (
                <TextField
                    {...field}
                    select
                    fullWidth
                    onChange={(event) => {
                        onChange?.(event);
                        field.onChange(event.target.value);
                    }}
                    SelectProps={{ native: true }}
                    error={!!error}
                    helperText={error?.message}
                    {...other}
                >
                    {children}
                </TextField>
            )}
        />
    );
}
