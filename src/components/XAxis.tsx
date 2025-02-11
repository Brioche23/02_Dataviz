import { observer } from "mobx-react-lite"
type TicksType = {
  value: number
  offset: number
}

interface XAxisProps {
  margins: {
    top: number
    right: number
    bottom: number
    left: number
  }
  xTicks: TicksType[]
  xLabel: string
}

export const XAxis = observer(({ margins, xTicks, xLabel }: XAxisProps) => {
  //   const mst = useMst()
  return (
    <g className="-x-axis">
      {/* X-Axis */}
      <line
        x1={margins.left}
        x2={margins.right}
        y1={margins.bottom}
        y2={margins.bottom}
        stroke="#FFFFFF"
      />
      <g className="-x-ticks">
        {xTicks.map(
          (
            { value, offset } // 1 map -> 1 rendering
          ) => (
            // Transform danno problemi -> dubbi su origin degli elementi
            <line
              key={value}
              x1={offset}
              x2={offset}
              y1={margins.bottom}
              y2={margins.bottom + 6}
              stroke="#FFFFFF"
            />
          )
        )}
      </g>
      <g className="-x-labels">
        {xTicks.map(
          (
            { value, offset } // 1 map -> 1 rendering
          ) => (
            <text
              key={value}
              x={offset}
              y={margins.bottom + 20}
              fill="#FFFFFF"
              fontSize={10}
              textAnchor="middle"
            >
              {value}
            </text>
          )
        )}
        <text
          x={margins.right}
          y={margins.bottom + 30}
          fill="#FFFFFF"
          fontSize={10}
          textAnchor="middle"
        >
          {xLabel}
        </text>
      </g>
    </g>
  )
})
