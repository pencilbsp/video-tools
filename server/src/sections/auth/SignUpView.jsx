"use client";
import { toast } from "sonner";
import NextLink from "next/link";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
// @mui
import Link from "@mui/material/Link";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import LoadingButton from "@mui/lab/LoadingButton";
import InputAdornment from "@mui/material/InputAdornment";
// icons
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
// libs
import { signUpSchema } from "@/libs/validate";
import { FormProvider, RHFTextField } from "@/components/HookForm";
// actions
import signUp from "@/actions/sign-up";

// ----------------------------------------------------------------------

const defaultValues = { name: "", email: "", password: "" };

export default function SignupView() {
    const formId = useId();
    const [showPassword, setShowPassword] = useState(false);

    const methods = useForm({
        defaultValues,
        resolver: yupResolver(signUpSchema),
    });

    const {
        handleSubmit,
        formState: { isSubmitting },
    } = methods;

    const handleSignup = async (data) => {
        const result = await signUp(data);
        if (result.error) return toast.error(result.error.message);

        toast.success(result.message);
    };

    return (
        <Stack alignItems="center" justifyContent="center" sx={{ height: 1 }}>
            <Card
                sx={{
                    p: 5,
                    width: 1,
                    maxWidth: 420,
                }}
            >
                <Typography variant="h4">Đăng ký tài khoản</Typography>

                <Typography variant="body2" sx={{ mt: 2, mb: 5 }}>
                    Đã có tài khoản?
                    <Link href="/login" variant="subtitle2" sx={{ ml: 0.5 }} component={NextLink}>
                        Đăng nhập
                    </Link>
                </Typography>

                <Divider sx={{ my: 3 }}>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        HOẶC
                    </Typography>
                </Divider>

                <FormProvider id={formId} methods={methods} onSubmit={handleSubmit(handleSignup)}>
                    <Stack spacing={3} mb={3}>
                        <RHFTextField name="name" label="Tên" />

                        <RHFTextField name="email" label="Email" />

                        <RHFTextField
                            name="password"
                            label="Mật khẩu"
                            type={showPassword ? "text" : "password"}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                            {showPassword ? <VisibilityOffIcon /> : <RemoveRedEyeIcon />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Stack>
                </FormProvider>

                <LoadingButton
                    fullWidth
                    size="large"
                    form={formId}
                    type="submit"
                    color="inherit"
                    variant="contained"
                    loading={isSubmitting}
                >
                    Đăng ký
                </LoadingButton>
            </Card>
        </Stack>
    );
}
