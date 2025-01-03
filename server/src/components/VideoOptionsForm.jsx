import { useState } from "react"
import { useFormContext } from "react-hook-form"
// @mui
import { TabContext, TabPanel, TabList } from "@mui/lab"
import { Stack, Tab, Box, Typography, Divider, TextField } from "@mui/material"
// libs
import { formatData } from "@/libs/format"
import { MAX_LOGO_SIZE, MAX_SUBTITLE_SIZE } from "@/libs/configs"
//
import LogoSelect from "./LogoSelect"
import StyleSelect from "./StyleSelect"
import ClusterSelect from "./ClusterSelect"
import { RHFSelect, RHFSwitch, RHFTextField, RHFUploadLogo, RHFUploadSubtitle } from "./HookForm"

// ----------------------------------------------------------------------

const defaultTabs = [
  {
    id: "1",
    label: "Tổng quan",
  },
  {
    id: "2",
    label: "Thêm logo",
  },
  {
    id: "3",
    label: "Thêm phụ đề",
  },
  {
    id: "4",
    label: "Chọn cluster",
  },
]

const disalbeList = ["downloaded", "done"]

export default function VideoOptionsForm({ mode, tabs = defaultTabs, onDrop, cookies, status }) {
  const [tab, setTab] = useState(tabs[0].id)
  const { watch, setValue } = useFormContext()

  return (
    <TabContext value={tab}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <TabList onChange={(_, nextTab) => setTab(nextTab)} scrollButtons allowScrollButtonsMobile>
          {tabs.map((tab) => {
            if (!tab) return null
            return <Tab value={tab.id} key={tab.id} label={tab.label} />
          })}
        </TabList>
      </Box>

      <TabPanel value={tabs[0].id} sx={{ px: 0, pb: 0 }}>
        <Stack spacing={1}>
          {mode !== "global" && (
            <RHFTextField
              disabled
              size="small"
              name="nativeUrl"
              label="URL video"
              sx={{ marginBottom: "16px !important" }}
            />
          )}

          {mode !== "global" ? (
            <RHFTextField size="small" sx={{ marginBottom: "16px !important" }} label="Tên video" name="name" />
          ) : (
            <RHFTextField
              size="small"
              name="options.namePrefix"
              label="Tuỳ chỉnh tên video"
              sx={{ marginBottom: "16px !important" }}
            />
          )}

          {watch("options.upload") && (
            <RHFTextField
              size="small"
              label="ID thư mục Google Drive"
              name="options.rootUploadFolderId"
              sx={{ marginBottom: "16px !important" }}
            />
          )}

          <RHFSelect
            size="small"
            label="Chất lượng video tải xuống"
            name="options.downloadVideoQuality"
            disabled={disalbeList.includes(status)}
            sx={{ marginBottom: "16px !important" }}
          >
            <option value="auto-lowest">Tự động thấp nhất</option>
            <option value="720P">HD 720P</option>
            <option value="1080P">FullHD 1080P</option>
            <option value="4K">UltraHD 2160P</option>
            <option value="auto-highest">Tự động cao nhất</option>
          </RHFSelect>

          {Array.isArray(cookies) && (
            <TextField
              select
              fullWidth
              size="small"
              label="Cookie"
              SelectProps={{ native: true }}
              disabled={disalbeList.includes(status)}
              sx={{ marginBottom: "16px !important" }}
              onChange={({ target }) => setValue("cookie", cookies[+target.value])}
            >
              {cookies.map((cookie, index) => (
                <option key={cookie.id} value={index}>
                  {cookie.name}
                </option>
              ))}
            </TextField>
          )}

          <RHFSelect
            size="small"
            label="Ngôn ngữ phụ đề"
            name="options.targetSubtitleLanguage"
            disabled={disalbeList.includes(status)}
            sx={{ marginBottom: "16px !important" }}
          >
            <option value="en">Tiếng Anh (khi khả dụng)</option>
            <option value="vi">Tiếng Việt (khi khả dụng)</option>
          </RHFSelect>

          <StyleSelect name="style" sx={{ marginBottom: "8px !important" }} disabled={status === "done"} />

          <RHFSwitch
            labelPlacement="start"
            label="Tạo thuyết minh"
            name="options.createDubbing"
            disabled={status === "done"}
          />

          <RHFSwitch
            name="options.upload"
            labelPlacement="start"
            label="Tải lên Google Drive"
            disabled={status === "done"}
          />

          {watch("options.upload") && (
            <RHFSwitch
              labelPlacement="start"
              disabled={status === "done"}
              label="Tạo thư mục con khi tải lên"
              name="options.createUploadSubfolder"
            />
          )}

          <RHFSwitch
            labelPlacement="start"
            name="options.skipEncode"
            disabled={status === "done"}
            label="Bỏ qua encode/chỉ tải video"
          />
        </Stack>
      </TabPanel>

      <TabPanel value={tabs[1].id} sx={{ px: 0, pb: 0 }}>
        <LogoSelect name="logo" />

        <Divider sx={{ my: 2 }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            HOẶC TẢI LÊN
          </Typography>
        </Divider>

        <RHFUploadLogo
          name="logo"
          maxSize={MAX_LOGO_SIZE}
          accept={{ "image/png": [".png"], "image/jpeg": [".jpg", ".jpeg"] }}
          helperText={
            <Typography
              variant="caption"
              sx={{
                display: "block",
                color: "text.secondary",
              }}
            >
              Chấp nhận ảnh *.jpeg, *.jpg, *.png. Kích thước tối đa {formatData(MAX_LOGO_SIZE)}
            </Typography>
          }
        />
      </TabPanel>

      {tabs[2] && !!onDrop && (
        <TabPanel value={tabs[2].id} sx={{ px: 0, pb: 0 }}>
          <RHFUploadSubtitle
            onDrop={onDrop}
            name="subtitle"
            maxSize={MAX_SUBTITLE_SIZE}
            accept={{ "text/ass": [".ass"], "text/srt": [".srt"], "text/vtt": [".vtt"] }}
            helperText={`Chấp tệp tin phụ đề *.ass. Kích thước tối đa ${formatData(MAX_SUBTITLE_SIZE)}`}
          />
        </TabPanel>
      )}

      {tabs[3] && (
        <TabPanel value={tabs[3].id} sx={{ px: 0, pb: 0 }}>
          <ClusterSelect name="cluster" />
        </TabPanel>
      )}
    </TabContext>
  )
}
