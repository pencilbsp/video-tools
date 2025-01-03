import useSWR from "swr"
import { useEffect } from "react"

import useClusterSocket from "./useClusterSocket"

const connectStatus = ["downloading", "encoding"]

export default function useVideoSubscription(clusterId, videoId, status) {
  const socket = useClusterSocket(clusterId)
  const { data, mutate } = useSWR(videoId, () => {}, { fallbackData: {} })

  useEffect(() => {
    if (socket && connectStatus.includes(status)) {
      socket.on(videoId, (progress) => mutate(progress, { revalidate: false }))
      socket.emit("joinRoom", videoId)
    }

    return () => {
      if (socket) {
        socket.emit("leaveRoom", videoId)
      }
    }
  }, [socket, videoId, mutate, status])

  return data
}
