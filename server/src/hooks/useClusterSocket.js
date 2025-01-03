import { io } from "socket.io-client"
import useSWRSubscription from "swr/subscription"
import { useEffect, useRef, useState } from "react"

import useClusterList from "./useClusterList"

export default function useClusterSocket(clusterId) {
  const { clusterList } = useClusterList()

  const ioRef = useRef()
  const [clusterUrl, setClusterUrl] = useState()

  const { data: socket } = useSWRSubscription(
    clusterUrl,
    (url, { next }) => {
      if (!socket) {
        const socket = io(url)

        next(null, socket)
        ioRef.current = socket
      }

      return () => {
        next(null, undefined)
        ioRef.current?.close()
      }
    },
    { errorRetryCount: 1 }
  )

  useEffect(() => {
    const cluster = clusterList.find(({ id }) => id === clusterId)
    if (cluster) setClusterUrl(`${cluster.host.replace("http", "ws")}:${cluster.port}`)
  }, [clusterId, clusterList])

  return socket
}
