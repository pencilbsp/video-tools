import useSWR from "swr";
// actions
import { getClusters } from "@/actions/cluster";

const fallbackData = { clusterList: [] };

const fetcher = async () => getClusters();

export default function useClusterList() {
    const { data, mutate } = useSWR("clusterList", fetcher, { fallbackData });

    return {
        ...data,
        mutate,
    };
}
