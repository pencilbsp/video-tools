"use client"
// @mui
import Box from "@mui/material/Box"
import Table from "@mui/material/Table"
import Paper from "@mui/material/Paper"
import TableBody from "@mui/material/TableBody"
import TableContainer from "@mui/material/TableContainer"
// redux
import { useDispatch, useSelector, videoParserSlice, addVideosToQueue, selectVideoParser } from "@/libs/redux"
//
import VideoListTableRow from "./VideoListTableRow"
import VideoListTableHead from "./VideoListTableHead"
import VideoListTableToolbar from "./VideoListTableToolbar"

// ----------------------------------------------------------------------

const headCells = [
  {
    id: "name",
    numeric: false,
    label: "Tên",
    minWidth: 300,
  },
  {
    id: "id",
    numeric: true,
    label: "Video ID",
  },
  {
    id: "duration",
    numeric: true,
    label: "Thời lượng",
  },
  {
    id: "status",
    numeric: true,
    label: "Trạng thái",
  },
  {
    id: "action",
    label: "",
  },
]

export default function VideoListTable() {
  const dispatch = useDispatch()
  const { videoList, selected, order, orderBy, status, title } = useSelector(selectVideoParser)

  const isLoading = status === "loading"
  const isSelected = (id) => selected.indexOf(id) !== -1

  // defaultOptions = { ignoreDouble: true, resetError: true }
  const handleAddVideosToQueue = () => dispatch(addVideosToQueue())
  const handleSelectAll = (payload) => dispatch(videoParserSlice.actions.selectAll(payload))
  const handleRequestSort = (payload) => dispatch(videoParserSlice.actions.requestSort(payload))

  if (videoList.length === 0) return null

  return (
    <Box sx={{ width: "100%" }}>
      <Paper sx={{ width: "100%", overflow: "hidden" }} variant="outlined">
        <VideoListTableToolbar
          isLoading={isLoading}
          title={"Danh sách video: " + title}
          numSelected={selected.length}
          onAddVideosToQueue={handleAddVideosToQueue}
        />
        <TableContainer>
          <Table aria-label="collapsible table">
            <VideoListTableHead
              order={order}
              orderBy={orderBy}
              isLoading={isLoading}
              headCells={headCells}
              rowCount={videoList.length}
              numSelected={selected.length}
              onRequestSort={handleRequestSort}
              onSelectAllClick={handleSelectAll}
            />
            <TableBody>
              {videoList.map((video) => (
                <VideoListTableRow
                  video={video}
                  key={video.vid}
                  isLoading={isLoading}
                  isSelected={isSelected(video.vid)}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  )
}
