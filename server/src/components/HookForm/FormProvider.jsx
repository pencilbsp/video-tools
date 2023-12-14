import { styled } from "@mui/material"
import { FormProvider as Form } from "react-hook-form"

// ----------------------------------------------------------------------

const FormStyled = styled("form")({})

export default function FormProvider({ id, children, onSubmit, methods, sx }) {
  return (
    <Form {...methods}>
      <FormStyled sx={sx} id={id} onSubmit={onSubmit}>
        {children}
      </FormStyled>
    </Form>
  )
}
