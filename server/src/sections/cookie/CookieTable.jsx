"use client";
import { useEffect, useState } from "react";
// @mui
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TablePagination from "@mui/material/TablePagination";
// redux
import { getCookies, selectCookie, useDispatch, useSelector, cookieSlice } from "@/libs/redux";
//
import CookieEditor from "./CookieEditor";
import CookieTableRow from "./CookieTableRow";
import CookieTableHead from "./CookieTableHead";
import CookieTableToolbar from "./CookieTableToolbar";

export default function CookieTable() {
    const dispatch = useDispatch();
    const [open, setOpen] = useState({ open: false, cookie: null });
    const { cookieList, order, orderBy, take, page, selected, total } = useSelector(selectCookie);

    const handleSelectAllClick = (event) => {
        dispatch(cookieSlice.actions.selectAll(event.target.checked));
    };

    const handleClick = (_, id) => {
        dispatch(cookieSlice.actions.select(id));
    };

    const handleChangePage = (_, newPage) => {
        dispatch(getCookies({ page: newPage }));
    };

    const isSelected = (id) => selected.indexOf(id) !== -1;

    // Avoid a layout jump when reaching the last page with empty rows.
    // const emptyRows = page > 0 ? Math.max(0, (1 + page) * take - cookieList.length) : 0

    useEffect(() => {
        dispatch(getCookies());
    }, [dispatch]);

    return (
        <>
            <Paper sx={{ width: "100%", mb: 2, overflow: "hidden" }} variant="outlined">
                <CookieTableToolbar
                    currentPage={page}
                    selected={selected}
                    rowCount={cookieList.length}
                    onOpen={() => setOpen({ ...open, open: true })}
                />
                <TableContainer>
                    <Table aria-labelledby="tableTitle">
                        <CookieTableHead
                            order={order}
                            orderBy={orderBy}
                            onRequestSort={() => {}}
                            rowCount={cookieList.length}
                            numSelected={selected.length}
                            onSelectAllClick={handleSelectAllClick}
                        />
                        <TableBody>
                            {cookieList.map((row, index) => {
                                const isItemSelected = isSelected(row.id);
                                const labelId = `enhanced-table-checkbox-${index}`;

                                return (
                                    <CookieTableRow
                                        row={row}
                                        key={row.id}
                                        labelId={labelId}
                                        onSelect={handleClick}
                                        isSelected={isItemSelected}
                                        onOpenEdit={(cookie) => setOpen({ open: true, cookie })}
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

            <CookieEditor {...open} onClose={() => setOpen({ cookie: null, open: false })} />
        </>
    );
}
