import numeral from "numeral";
import vi from "date-fns/locale/vi";
import { intervalToDuration, formatDuration as fd, formatDistanceToNow as fdtn, format } from "date-fns";

const zeroPad = (num) => String(num).padStart(2, "0");

export function formatData(number) {
    return numeral(number).format("0.0 b");
}

export function timeToSeconds(timeString) {
    const [hours, minutes, seconds] = timeString.split(":").map(Number);
    // Tính tổng số giây
    return hours * 3600 + minutes * 60 + seconds;
}

export function formatDuration(seconds) {
    const duration = intervalToDuration({ start: 0, end: seconds * 1000 });

    return fd(duration, {
        // format: ["minutes", "seconds"],
        zero: true,
        delimiter: ":",
        format: ["hours", "minutes", "seconds"],
        locale: {
            formatDistance: (_token, count) => zeroPad(count),
        },
    });
}

export function formatDistanceToNow(date) {
    return fdtn(new Date(date), { locale: vi, addSuffix: true });
}

export function formatDate(date, formatString = "dd/MM/yyyy") {
    return format(new Date(date), formatString, { locale: vi });
}
