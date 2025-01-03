import { Alert, AlertTitle, Chip, Stack, Typography } from "@mui/material";

import VideoParser from "@/sections/start/VideoParser";
import VideoListTable from "@/sections/start/VideoListTable";

export default function StartPage() {
    return (
        <Stack spacing={3}>
            <Typography component="h1" variant="h4">
                Bắt đầu
            </Typography>

            <Alert severity="success">
                <AlertTitle>
                    <Typography variant="button">Trang web hỗ trợ</Typography>
                </AlertTitle>
                <Stack direction="row" spacing={1}>
                    <Chip color="success" label="wetv.vip" clickable />
                    <Chip color="success" label="iq.com" clickable />
                    <Chip color="success" label="bilibili.tv" clickable />
                    <Chip color="success" label="youku.tv" clickable />
                    <Chip color="warning" label="drive.google.com" clickable />
                </Stack>
            </Alert>

            <VideoParser />

            <VideoListTable />
        </Stack>
    );
}
