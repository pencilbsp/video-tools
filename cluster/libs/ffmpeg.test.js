import FFmpeg from "./ffmpeg";

const testUrl = "http://127.0.0.1:5500/cluster/assets/m3u8/test.m3u8";
const testOutput = "/Users/pencil/Developer/video-tools/cluster/assets/videos/test.mp4";

const ffmpeg = new FFmpeg(testUrl, ["-c copy"]);

const interval = setInterval(() => {
    console.log(ffmpeg.getProgress());
}, 1000);

setTimeout(() => {
    ffmpeg.stop();
}, 10000);

ffmpeg.start(testOutput);
