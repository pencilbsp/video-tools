/* Instruments */
import { videoParserSlice, cookieSlice, styleSlice } from "./slices";

export const reducer = {
    style: styleSlice.reducer,
    cookie: cookieSlice.reducer,
    videoParser: videoParserSlice.reducer,
};
