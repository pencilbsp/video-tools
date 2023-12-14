import { useEffect } from "react"

/**
 * Hook that alerts clicks outside of the passed ref
 */
export default function useOutsideClick(ref, callback) {
  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event) {
      if (ref.current && document.activeElement === ref.current && !ref.current.contains(event.target)) {
        typeof callback === "function" && callback()
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [ref, callback])
}
