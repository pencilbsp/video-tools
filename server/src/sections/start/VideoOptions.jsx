"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Fragment, useEffect, useId, useState } from "react";
// @mui
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
// components
import { FormProvider } from "@/components/HookForm";
import VideoOptionsForm from "@/components/VideoOptionsForm";
// icons
import ManageHistoryIcon from "@mui/icons-material/ManageHistory";
// hooks
import useResponsive from "@/hooks/useResponsive";
// libs
import { videoSchema } from "@/libs/validate";
import { defaultVideoOptions } from "@/libs/configs";
// redux
import { selectVideoParser, useDispatch, useSelector, videoParserSlice } from "@/libs/redux";
//

// ----------------------------------------------------------------------

const tabs = [
    {
        id: "1",
        label: "Tổng quan",
    },
    {
        id: "2",
        label: "Thêm logo",
    },
    null,
    {
        id: "4",
        label: "Chọn cluster",
    },
];

const defaultValues = { ...defaultVideoOptions, mode: "global" };

export default function VideoOptions() {
    const formId = useId();
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const fullScreen = useResponsive("down", "sm");
    const { status, cookies } = useSelector(selectVideoParser);

    const handleClose = () => setOpen(false);
    const handleClickOpen = () => setOpen(true);

    const methods = useForm({ defaultValues, resolver: yupResolver(videoSchema) });

    const { reset, handleSubmit, formState } = methods;

    const applyOptions = (options) => {
        dispatch(videoParserSlice.actions.applyOption(options));
    };

    // useEffect(() => {
    //   // reset(defaultValues)
    //   console.log(defaultValues)
    //   // Fixed: Uncaught (in promise) TypeError: Cannot assign to read only
    //   // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [open])

    return (
        <Fragment>
            <Tooltip title="Tuỳ chỉnh video đã chọn">
                <IconButton onClick={handleClickOpen} disabled={status === "loading"}>
                    <ManageHistoryIcon />
                </IconButton>
            </Tooltip>
            <Dialog open={open} fullScreen={fullScreen} maxWidth="xs">
                <FormProvider methods={methods} id={formId} onSubmit={handleSubmit(applyOptions)}>
                    <DialogContent>
                        <VideoOptionsForm mode="global" tabs={tabs} methods={methods} cookies={cookies} />
                    </DialogContent>
                    <DialogActions>
                        <Button type="submit" variant="outlined" disabled={!formState.isDirty}>
                            Áp dụng
                        </Button>
                        <Button
                            color="warning"
                            variant="outlined"
                            disabled={!formState.isDirty}
                            onClick={() => reset(defaultValues)}
                        >
                            Khôi phục
                        </Button>
                        <Button variant="outlined" color="error" onClick={handleClose} autoFocus>
                            Thoát
                        </Button>
                    </DialogActions>
                </FormProvider>
            </Dialog>
        </Fragment>
    );
}
