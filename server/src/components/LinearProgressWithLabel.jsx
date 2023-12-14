import Stack from "@mui/material/Stack"
import { styled } from "@mui/material/styles"
import Typography from "@mui/material/Typography"
import LinearProgress, { linearProgressClasses } from "@mui/material/LinearProgress"

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  width: "100%",
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: theme.palette.grey[theme.palette.mode === "light" ? 200 : 800],
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: theme.palette.mode === "light" ? "#1a90ff" : "#308fe8",
  },
}))

export default function LinearProgressWithLabel({ percent, status, message }) {
  if (percent && percent > 0)
    return (
      <Stack width={1} direction="row" alignItems="center" spacing={1}>
        <BorderLinearProgress variant="determinate" value={percent ?? 0} />
        <Typography variant="caption">{`${Math.round(percent)}%`}</Typography>
      </Stack>
    )

  return null
}
