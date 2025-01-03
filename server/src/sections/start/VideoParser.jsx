"use client";

import * as yup from "yup";
import { toast } from "sonner";
import { Stack } from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
// redux
import { useDispatch, parseFromUrl, useSelector, selectVideoParser } from "@/libs/redux";
// hooks
import useResponsive from "@/hooks/useResponsive";
// libs
import { IS_SUPPORT_URL, isSupportUrl } from "@/libs/validate";
// components
import { FormProvider, RHFTextField } from "@/components/HookForm";
//
import ParserOptions from "./ParserOptions";

// ----------------------------------------------------------------------

const Schema = yup.object().shape({
    url: yup.string().required("Nhập URL của video để tiếp tục").matches(IS_SUPPORT_URL, "Trang web không được hỗ trợ"),
});

export default function VideoParser() {
    const isMobile = useResponsive("down", "sm");

    const dispatch = useDispatch();
    const { status } = useSelector(selectVideoParser);

    const methods = useForm({
        defaultValues: { url: "" },
        resolver: yupResolver(Schema),
    });

    const { handleSubmit } = methods;

    const onSubmit = (data) => dispatch(parseFromUrl(data));

    const handlePaste = (event) => {
        event.preventDefault();
        const url = event.clipboardData.getData("Text");

        if (!url || !isSupportUrl(url)) {
            toast.warning("Trang web không được hỗ trợ");
        } else {
            document.execCommand("insertHTML", false, url);
            onSubmit({ url });
        }
    };

    return (
        <Stack direction="row" spacing={2} alignItems="start">
            <FormProvider methods={methods} sx={{ flex: 1 }} onSubmit={handleSubmit(onSubmit)}>
                <RHFTextField
                    name="url"
                    size="small"
                    sx={{ width: 1 }}
                    onPaste={handlePaste}
                    placeholder="URL của video"
                    disabled={status === "loading"}
                />
            </FormProvider>
            <ParserOptions />
        </Stack>
    );
}
