import { useEffect, useState } from "react"

export function useMouseMove() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    onmousemove = (e) => {
      const mousePosition = {
        x: e.pageX,
        y: e.pageY,
      }
      setMousePosition(mousePosition)
    }

    // window.addEventListener("mousemove",  handleMouseMove(e)) //se non rimuovo, si incrementano

    // return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [setMousePosition])

  return mousePosition
}
