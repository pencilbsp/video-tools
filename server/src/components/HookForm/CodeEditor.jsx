import { memo } from "react"
import dynamic from "next/dynamic"
import { useFormContext, Controller } from "react-hook-form"
// dynamic import
const MonacoEditor = dynamic(() => import("@monaco-editor/react"))

const CookieEditor = function ({ name, language = "javascript", options }) {
  const { control, setError } = useFormContext()

  const handleValidation = (markers) => setError(name, markers[0])

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value } }) => {
        const handleChange = (value) => onChange({ target: { value } })
        return (
          <MonacoEditor
            value={value}
            options={options}
            onChange={handleChange}
            defaultLanguage={language}
            onValidate={handleValidation}
          />
        )
      }}
    />
  )
}

export default memo(CookieEditor)
