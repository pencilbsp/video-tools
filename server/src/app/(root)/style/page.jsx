// sections
import StyleTable from "@/sections/style/StyleTable";
// @mui
import { Stack, Typography } from "@mui/material";

export default async function StylePage() {
    return (
        <Stack spacing={3}>
            <Typography component="h1" variant="h4">
                Quản lý Style
            </Typography>

            <StyleTable />
        </Stack>
    );
}
