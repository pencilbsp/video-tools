"use client"
import { useState } from "react"
// @mui
import { Tab, Tabs, Stack, Table, Paper, Divider, TableBody, TableContainer, TablePagination } from "@mui/material"
// components
import Label from "@/components/Label"
// hooks
import useVideoList from "@/hooks/useVideoList"
// sections
import VideoOptions from "./VideoOptions"
import VideoTableRow from "./VideoTableRow"
import VideoTableHead from "./VideoTableHead"
import VideoTableToolbar from "./VideoTableToolbar"

// ----------------------------------------------------------------------

const TABS = [
  { value: "processing", label: "Đang xử lý", color: "info" },
  { value: "done", label: "Đã hoàn thành", color: "success" },
  { value: "error", label: "Lỗi", color: "error" },
]

export default function VideoTable() {
  const [open, setOpen] = useState({ open: false, video: null })
  const {
    page,
    take,
    total,
    order,
    orderBy,
    selected,
    videoList,
    currentTab,
    handelDelete,
    handleSelect,
    handleSelectAll,
    handelChangeTab,
    handleChangePage,
  } = useVideoList(TABS[0].value)

  const isSelected = (id) => selected.indexOf(id) !== -1

  return (
    <>
      <Paper sx={{ width: "100%", mb: 2, overflow: "hidden" }} variant="outlined">
        <VideoTableToolbar currentPage={page} selected={selected} rowCount={videoList.length} onDelete={handelDelete}>
          <Tabs
            value={currentTab}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            onChange={(_, tab) => handelChangeTab(tab)}
            sx={{ height: { xs: 48, sm: 56 }, "& .MuiTabs-scroller, & .MuiTabs-flexContainer": { height: 1 } }}
          >
            {TABS.map((tab) => (
              <Tab
                disableRipple
                key={tab.value}
                value={tab.value}
                label={
                  <Stack spacing={1} direction="row" alignItems="center">
                    <div>{tab.label}</div> <Label color={tab.color}>{tab.value === currentTab ? total : "N/A"}</Label>
                  </Stack>
                }
              />
            ))}
          </Tabs>
        </VideoTableToolbar>

        <Divider />

        <TableContainer>
          <Table>
            <VideoTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={() => {}}
              rowCount={videoList.length}
              numSelected={selected.length}
              onSelectAllClick={handleSelectAll}
            />

            <TableBody>
              {videoList.map((row, index) => {
                const isItemSelected = isSelected(row.id)
                const labelId = `enhanced-table-checkbox-${index}`

                return (
                  <VideoTableRow
                    row={row}
                    key={row.id}
                    labelId={labelId}
                    onSelect={handleSelect}
                    isSelected={isItemSelected}
                    onOpenEdit={(video) => setOpen({ open: true, video })}
                  />
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          page={page}
          count={total}
          component="div"
          rowsPerPage={take}
          rowsPerPageOptions={[]}
          onPageChange={(_, page) => handleChangePage(page)}
        />
      </Paper>

      <VideoOptions {...open} onClose={() => setOpen({ open: false, video: null })} />
    </>
  )
}
