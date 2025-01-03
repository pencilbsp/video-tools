"use client";
import { toast } from "sonner";
import NextLink from "next/link";
import { useId, useState } from "react";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter, useSearchParams } from "next/navigation";
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
import { loginSchema } from "@/libs/validate";
import { FormProvider, RHFTextField } from "@/components/HookForm";

// ----------------------------------------------------------------------

const defaultValues = { email: "", password: "" };

export default function LoginView() {
    const formId = useId();
    const { push } = useRouter();
    const [showPassword, setShowPassword] = useState(false);

    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("next") || "/";

    const methods = useForm({
        defaultValues,
        resolver: yupResolver(loginSchema),
    });

    const {
        handleSubmit,
        formState: { isSubmitting },
    } = methods;

    const handleLogin = async (data) => {
        const { error } = await signIn("credentials", {
            redirect: false,
            email: data.email,
            password: data.password,
        });

        if (error) return toast.error(error);
        push(callbackUrl);
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
                <Typography variant="h4">Đăng nhập</Typography>

                <Typography variant="body2" sx={{ mt: 2, mb: 5 }}>
                    Chưa có tài khoản?
                    <Link href="/signup" variant="subtitle2" sx={{ ml: 0.5 }} component={NextLink}>
                        Đăng ký
                    </Link>
                </Typography>

                <Divider sx={{ my: 3 }}>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        HOẶC
                    </Typography>
                </Divider>

                <FormProvider id={formId} methods={methods} onSubmit={handleSubmit(handleLogin)}>
                    <Stack spacing={3}>
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

                <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{ my: 3 }}>
                    <Link variant="subtitle2" underline="hover">
                        Quên mật khẩu?
                    </Link>
                </Stack>

                <LoadingButton
                    fullWidth
                    size="large"
                    form={formId}
                    type="submit"
                    color="inherit"
                    variant="contained"
                    loading={isSubmitting}
                >
                    Đăng nhập
                </LoadingButton>
            </Card>
        </Stack>
    );
}
