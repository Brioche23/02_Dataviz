import { useEffect, useState } from "react"

function getPageSize() {
  console.log("w", window.innerWidth, "h", window.innerHeight)

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  }
}

export function useWindowSize() {
  const [pageSize, setPageSize] = useState(getPageSize())

  useEffect(() => {
    function handleResize() {
      setPageSize(getPageSize())
    }

    window.addEventListener("resize", handleResize) //se non rimuovo, si incrementano

    return () => window.removeEventListener("resize", handleResize)
  }, [setPageSize])

  return pageSize
}
