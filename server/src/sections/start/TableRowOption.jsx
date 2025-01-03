import { styled } from "@mui/material/styles";

import Table from "@mui/material/Table";
import Switch from "@mui/material/Switch";
import TableRow from "@mui/material/TableRow";
import Collapse from "@mui/material/Collapse";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TextField from "@mui/material/TextField";
import NativeSelect from "@mui/material/NativeSelect";
// redux
import { selectVideoParser, useDispatch, useSelector, videoParserSlice } from "@/libs/redux";
// configs
import { videoOptionsMapName as mapName } from "@/libs/configs";

// ----------------------------------------------------------------------

const TableCellStyled = styled(TableCell)({});

export default function TableRowOption({ videoId, options, open }) {
    const dispatch = useDispatch();
    const { cookies } = useSelector(selectVideoParser);

    const cookie = cookies.find(({ id }) => id === options.cookieId);

    const handleChange = (event) => {
        const key = event.target.getAttribute("name");
        const type = event.target.getAttribute("type");
        const value = type === "checkbox" ? event.target.checked : event.target.value;

        dispatch(videoParserSlice.actions.modifyOption({ videoId, key, value }));
    };

    return (
        <TableRow>
            <TableCell colSpan={6} style={{ paddingBottom: 0, paddingTop: 0 }}>
                <Collapse in={open} timeout="auto" unmountOnExit>
                    <Table size="small" aria-label="purchases">
                        <TableBody>
                            <TableRow>
                                <TableCellStyled component="th">{mapName.createDubbing}</TableCellStyled>
                                <TableCell align="right">
                                    <Switch
                                        size="small"
                                        name="createDubbing"
                                        onChange={handleChange}
                                        checked={options.createDubbing}
                                    />
                                </TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCellStyled component="th">{mapName.skipEncode}</TableCellStyled>
                                <TableCell align="right">
                                    <Switch
                                        size="small"
                                        name="skipEncode"
                                        onChange={handleChange}
                                        checked={options.skipEncode}
                                    />
                                </TableCell>
                            </TableRow>

                            {cookie && (
                                <TableRow>
                                    <TableCellStyled component="th">{mapName.cookieId}</TableCellStyled>
                                    <TableCell align="right">{cookie.name}</TableCell>
                                </TableRow>
                            )}

                            {options.style && (
                                <TableRow>
                                    <TableCellStyled component="th">{mapName.style}</TableCellStyled>
                                    <TableCell align="right">{options.style.name}</TableCell>
                                </TableRow>
                            )}

                            <TableRow>
                                <TableCellStyled component="th">{mapName.downloadVideoQuality}</TableCellStyled>
                                <TableCell align="right">
                                    <NativeSelect
                                        size="small"
                                        onChange={handleChange}
                                        name="downloadVideoQuality"
                                        value={options.downloadVideoQuality}
                                    >
                                        <option value="auto">Auto</option>
                                        <option value="720P">HD 720P</option>
                                        <option value="1080P">FullHD 1080P</option>
                                    </NativeSelect>
                                </TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCellStyled component="th">{mapName.targetSubtitleLanguage}</TableCellStyled>
                                <TableCell align="right">
                                    <NativeSelect
                                        size="small"
                                        onChange={handleChange}
                                        name="targetSubtitleLanguage"
                                        value={options.targetSubtitleLanguage}
                                    >
                                        <option value="vi">Tiếng Việt (khi khả dụng)</option>
                                        <option value="en">Tiếng Anh (khi khả dụng)</option>
                                    </NativeSelect>
                                </TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCellStyled component="th">{mapName.ffmpegOptions}</TableCellStyled>
                                <TableCell align="right">
                                    <TextField
                                        size="small"
                                        variant="standard"
                                        defaultValue={options.ffmpegOptions}
                                        placeholder="Ví dụ: out[-crf 30]"
                                    />
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </Collapse>
            </TableCell>
        </TableRow>
    );
}
