"use client"
import { toast } from "sonner"
import { useFormContext, Controller } from "react-hook-form"
import { useState, useRef, useTransition, useEffect } from "react"
// @mui
import List from "@mui/material/List"
import Dialog from "@mui/material/Dialog"
import Button from "@mui/material/Button"
import ListItem from "@mui/material/ListItem"
import TextField from "@mui/material/TextField"
import IconButton from "@mui/material/IconButton"
import LoadingButton from "@mui/lab/LoadingButton"
import DialogTitle from "@mui/material/DialogTitle"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import InputAdornment from "@mui/material/InputAdornment"
import DialogContentText from "@mui/material/DialogContentText"
// icons
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye"
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff"
//
import ClusterSelectItem from "./ClusterSelectItem"
import { verifyPassword } from "@/actions/cluster"
// hooks
import useClusterList from "@/hooks/useClusterList"

export default function ClusterSelect({ name }) {
  const passwordRef = useRef(null)
  const callbackRef = useRef(null)

  const [open, setOpen] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const { control } = useFormContext()
  const { clusterList } = useClusterList()
  const [pending, startTransition] = useTransition()

  const handleClose = () => {
    callbackRef.current = null
    passwordRef.current = null
    setOpen("")
  }

  const handleVerifyPassword = () => {
    if (!callbackRef.current) return
    if (!passwordRef.current?.value) return passwordRef.current.focus()
    startTransition(async () => {
      try {
        const result = await verifyPassword(open, passwordRef.current.value)
        if (result.error) throw new Error(result.error.message)

        console.log(result.cluster)
        callbackRef.current({ target: { value: result.cluster } })
        handleClose()
      } catch (error) {
        toast.error(error.message)
      }
    })
  }

  // useEffect(() => {
  //   return () => {
  //     handleClose()
  //   }
  // }, [])

  return (
    <>
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          return (
            <List>
              {clusterList.map((cluster) => (
                <ListItem key={cluster.id} sx={{ px: 0 }}>
                  <ClusterSelectItem
                    cluster={cluster}
                    {...field}
                    onVerify={(id, callback) => {
                      setOpen(id)
                      callbackRef.current = callback
                    }}
                  />
                </ListItem>
              ))}
            </List>
          )
        }}
      />

      <Dialog maxWidth="xs" open={!!open}>
        <DialogTitle>Xác nhận mật khẩu</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            Cluster này được chia sẻ giới hạn bằng mật khẩu. Nếu bạn được chia sẻ bạn hãy nhập mật khẩu từ chủ sở hữu
            tiếp tục để sử dụng.
          </DialogContentText>

          {/* <TextField inputRef={passwordRef} size="small" fullWidth label="Mật khẩu" type="password" /> */}
          <TextField
            fullWidth
            size="small"
            label="Mật khẩu"
            inputRef={passwordRef}
            type={showPassword ? "text" : "password"}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? (
                      <VisibilityOffIcon sx={{ width: 18, height: 18 }} />
                    ) : (
                      <RemoveRedEyeIcon sx={{ width: 18, height: 18 }} />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button color="error" variant="outlined" onClick={handleClose} disabled={pending}>
            Huỷ
          </Button>
          <LoadingButton
            autoFocus
            loading={pending}
            variant="outlined"
            disabled={pending}
            onClick={handleVerifyPassword}
          >
            Xác nhận
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  )
}
