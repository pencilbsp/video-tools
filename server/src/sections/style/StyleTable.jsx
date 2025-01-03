"use client";
import { useEffect, useState } from "react";
// @mui
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TablePagination from "@mui/material/TablePagination";
// redux
import { getStyles, useDispatch, useSelector, styleSlice, selectStyle } from "@/libs/redux";
//
import StyleForm from "./StyleForm";
import StyleTableRow from "./StyleTableRow";
import StyleTableHead from "./StyleTableHead";
import StyleTableToolbar from "./StyleTableToolbar";

export default function StyleTable() {
    const dispatch = useDispatch();
    const [open, setOpen] = useState({ open: false, style: null });
    const { styleList, order, orderBy, take, page, selected, total } = useSelector(selectStyle);

    const handleSelectAllClick = (event) => {
        dispatch(styleSlice.actions.selectAll(event.target.checked));
    };

    const handleClick = (_, id) => {
        dispatch(styleSlice.actions.select(id));
    };

    const handleChangePage = (_, newPage) => {
        dispatch(getStyles({ page: newPage }));
    };

    const isSelected = (id) => selected.indexOf(id) !== -1;

    // Avoid a layout jump when reaching the last page with empty rows.
    // const emptyRows = page > 0 ? Math.max(0, (1 + page) * take - styleList.length) : 0

    useEffect(() => {
        dispatch(getStyles());
    }, [dispatch]);

    return (
        <>
            <Paper sx={{ width: "100%", mb: 2, overflow: "hidden" }} variant="outlined">
                <StyleTableToolbar
                    currentPage={page}
                    selected={selected}
                    rowCount={styleList.length}
                    onOpen={() => setOpen({ ...open, open: true })}
                />
                <TableContainer>
                    <Table aria-labelledby="tableTitle">
                        <StyleTableHead
                            order={order}
                            orderBy={orderBy}
                            onRequestSort={() => {}}
                            rowCount={styleList.length}
                            numSelected={selected.length}
                            onSelectAllClick={handleSelectAllClick}
                        />
                        <TableBody>
                            {styleList.map((row, index) => {
                                const isItemSelected = isSelected(row.id);
                                const labelId = `enhanced-table-checkbox-${index}`;

                                return (
                                    <StyleTableRow
                                        row={row}
                                        key={row.id}
                                        labelId={labelId}
                                        onSelect={handleClick}
                                        isSelected={isItemSelected}
                                        onOpenEdit={(style) => setOpen({ open: true, style })}
                                    />
                                );
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
                    onPageChange={handleChangePage}
                />
            </Paper>

            <StyleForm {...open} onClose={() => setOpen({ style: null, open: false })} />
        </>
    );
}
