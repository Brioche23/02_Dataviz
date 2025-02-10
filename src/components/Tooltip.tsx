import { ReactNode } from "react"
import { useMouseMove } from "../hooks/useMouseMove"
import styles from "./Tooltip.module.css"
import classNames from "classnames"

interface TooltipProps {
  children?: ReactNode
}

export function Tooltip({ children }: TooltipProps) {
  const mousePosition = useMouseMove()
  //   const mst = useMst()
  console.log(mousePosition)
  return (
    <div
      className={classNames(styles.tooltip)}
      style={{
        top: `${mousePosition.y}px`,
        left: `${mousePosition.x + 25}px`,
      }}
    >
      {children}
    </div>
  )
}
