"use client";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { Fragment, useId, useState, useTransition } from "react";
// @mui
import { LoadingButton } from "@mui/lab";
import {
    Card,
    Stack,
    Button,
    Dialog,
    Divider,
    Typography,
    IconButton,
    DialogActions,
    DialogContent,
    InputAdornment,
} from "@mui/material";
// components
import { osLogo } from "@/components/ClusterItem";
import { FormProvider, RHFSwitch, RHFTextField } from "@/components/HookForm";
// actions
import { addCluster } from "@/actions/cluster";
// icons
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
//

const defaultValues = { host: "http://", port: "9909", name: "", password: "", isPublic: false };

export default function CreateCluster({ mutate }) {
    const formId = useId();
    const [open, setOpen] = useState(false);
    const [cluster, setCluster] = useState(null);
    const [pending, startTransition] = useTransition();
    const [showPassword, setShowPassword] = useState(false);

    const methods = useForm({ defaultValues });

    const { handleSubmit, setValue, getValues } = methods;

    const handleConnect = ({ port, host }) =>
        startTransition(async () => {
            try {
                // console.log(port, host)
                const response = await fetch(`${host}:${port}/ping`);
                const data = await response.json();
                if (data.ping !== "pong") throw new Error(data.message);
                setCluster(data);
                setValue("name", data.hostname);
            } catch (error) {
                console.log(error);
                toast.error(error.message);
            }
        });

    const handleAddCluster = () =>
        startTransition(async () => {
            try {
                const data = getValues();
                const result = await addCluster({ ...data, os: cluster });
                if (result.error) throw new Error(result.error.message);
                toast.success("Cluster đã được thêm thành công");
                mutate();
                setOpen(false);
            } catch (error) {
                // console.log(error)
                toast.error(error.message);
            }
        });

    // useEffect(() => {
    //   return () => {
    //     setCluster(null)
    //     reset(defaultValues)
    //   }
    // }, [open])

    return (
        <Fragment>
            <Button onClick={() => setOpen(true)} variant="contained">
                Thêm Cluster
            </Button>

            <Dialog open={open} maxWidth="xs">
                <FormProvider id={formId} methods={methods} onSubmit={handleSubmit(handleConnect)}>
                    <DialogContent>
                        <Stack spacing={3}>
                            <Stack direction="row" spacing={2}>
                                <RHFTextField size="small" label="Host" name="host" disabled={!!cluster} />
                                <RHFTextField
                                    size="small"
                                    label="Port"
                                    name="port"
                                    type="number"
                                    sx={{ maxWidth: 100 }}
                                    disabled={!!cluster}
                                />
                            </Stack>

                            {cluster && (
                                <>
                                    <RHFTextField size="small" label="Tên" name="name" />
                                    <RHFTextField
                                        size="small"
                                        name="password"
                                        label="Mật khẩu"
                                        type={showPassword ? "text" : "password"}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        edge="end"
                                                    >
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
                                    <RHFSwitch name="isPublic" label="Chia sẻ công khai" labelPlacement="start" />
                                    <Card sx={{ p: 2, display: "flex" }}>
                                        {osLogo(cluster.platform)}
                                        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                                        <Typography>{cluster.cpu.model}</Typography>
                                        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                                        <Typography>{`ffmpeg ${cluster.ffmpeg}`}</Typography>
                                    </Card>
                                </>
                            )}
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        {cluster ? (
                            <LoadingButton
                                variant="outlined"
                                disabled={!cluster}
                                onClick={handleAddCluster}
                                loading={pending}
                            >
                                Thêm
                            </LoadingButton>
                        ) : (
                            <LoadingButton
                                type="submit"
                                form={formId}
                                variant="outlined"
                                disabled={pending}
                                loading={pending}
                            >
                                Test
                            </LoadingButton>
                        )}

                        <Button variant="outlined" color="error" onClick={() => setOpen(false)} disabled={pending}>
                            Thoát
                        </Button>
                    </DialogActions>
                </FormProvider>
            </Dialog>
        </Fragment>
    );
}
