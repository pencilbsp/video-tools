"use clinet";

import useSWR from "swr";
import { useEffect, useState } from "react";

import { getVideos } from "@/actions/video";

const fetcher = ({ currentTab, page }) => {
    const status = currentTab === "processing" ? { notIn: ["error", "done"] } : currentTab;
    return getVideos({ status, page });
};

const fallbackData = { videoList: [], total: 0, take: 5, page: 0, orderBy: "updatedAt", order: "desc" };

export const editableStatus = ["pending", "error", "done", "downloaded", "muxed"];

export default function useVideoList(tab, interval = 5000) {
    const [page, setPage] = useState(0);
    const [int, setInt] = useState(interval);
    const [selected, setSelected] = useState([]);
    const [currentTab, setCurrentTab] = useState(tab);

    const { data, isLoading, mutate } = useSWR({ currentTab, page }, fetcher, {
        fallbackData,
        refreshInterval: int,
    });

    const handleSelect = (id) => {
        if (selected.includes(id)) {
            setSelected(selected.filter((e) => id !== e));
        } else {
            setSelected([...selected, id]);
        }
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelected(data.videoList.filter(({ status }) => editableStatus.includes(status)).map(({ id }) => id));
        } else {
            setSelected([]);
        }
    };

    const handelDelete = (deletedIds, deleteCount) => {
        const nextPage = data.videoList.length - deleteCount === 0 && page > 0 ? page - 1 : page;

        if (nextPage !== page) {
            setSelected([]);
            setPage(nextPage);
        } else {
            setSelected(selected.filter((id) => !deletedIds.includes(id)));
            mutate();
        }
    };

    const handleChangePage = (nextPage) => {
        if (nextPage > -1 && nextPage !== page) {
            setSelected([]);
            setPage(nextPage);
        }
    };

    const handelChangeTab = (nextTab) => {
        if (nextTab !== currentTab) {
            setPage(0);
            setSelected([]);
            setCurrentTab(nextTab);
        }
    };

    useEffect(() => {
        if (data.videoList) {
            const ids = data.videoList.map(({ id }) => id);
            const newSelected = selected.filter((id) => ids.includes(id));
            setSelected(newSelected);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    return {
        currentTab,
        handleSelect,
        handelDelete,
        handleSelectAll,
        take: data.take,
        page: data.page,
        handelChangeTab,
        handleChangePage,
        total: data.total,
        order: data.order,
        selected: selected,
        isLoading: isLoading,
        orderBy: data.orderBy,
        videoList: data.videoList,
    };
}
