"use client";

import merge from "lodash/merge";
import { createAsyncThunk } from "@reduxjs/toolkit";
// server actions
import videoParse from "@/actions/video-parse";
import submitVideos from "@/actions/submit-videos";
// libs
import { trimFalsely } from "@/libs/validate";
import { defaultVideoOptions } from "@/libs/configs";

export const addVideosToQueue = createAsyncThunk(
    "videoParser/addVideosToQueue",
    async function (options, { getState, rejectWithValue }) {
        const state = getState();
        const { selected, videoList } = state.videoParser;
        if (selected.length === 0) return rejectWithValue("Bạn chưa chọn video nào");

        const videos = videoList.filter(({ vid }) => selected.includes(vid));
        const result = await submitVideos(videos, options);

        if (!result) return rejectWithValue();
        if (result.error) return rejectWithValue(result.error.message);

        return result;
    },
);

export const addVideoToQueue = createAsyncThunk(
    "videoParser/addVideoToQueue",
    async function ({ videoId, options }, { getState, rejectWithValue }) {
        const state = getState();
        const videoList = state.videoParser.videoList;
        const video = videoList.find(({ vid }) => videoId === vid);
        if (!video) return rejectWithValue("Video không tồn tại");

        const result = await submitVideos([video], options);

        if (!result) return rejectWithValue();
        if (result.error) return rejectWithValue(result.error.message);

        return videoId;
    },
);

export const parseFromUrl = createAsyncThunk(
    "videoParser/parseFromUrl",
    async function ({ url }, { rejectWithValue, getState }) {
        const state = getState();
        const options = state.videoParser.options;
        const result = await videoParse(url, options);

        if (!result) return rejectWithValue();
        if (result.error) return rejectWithValue(result.error.message);

        const videoList = result.videoList.map((video) => merge(video, trimFalsely(defaultVideoOptions)));
        return { ...result, videoList };
    },
);
