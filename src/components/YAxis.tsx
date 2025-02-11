import { observer } from "mobx-react-lite"
type TicksType = {
  value: number
  offset: number
}

interface YAxisProps {
  margins: {
    top: number
    right: number
    bottom: number
    left: number
  }
  yTicks: TicksType[]
  yLabel: string
}

export const YAxis = observer(({ margins, yTicks, yLabel }: YAxisProps) => {
  //   const mst = useMst()
  return (
    <g className="-y-axis">
      {/* Y-Axis */}
      <line
        x1={margins.left}
        x2={margins.left}
        y1={margins.top}
        y2={margins.bottom}
        stroke="#FFFFFF"
      />

      <g className="-y-ticks">
        {yTicks.map(
          (
            { value, offset } // 1 map -> 1 rendering
          ) => (
            // Transform danno problemi -> dubbi su origin degli elementi
            <line
              key={value}
              x1={margins.left}
              x2={margins.left - 6}
              y1={offset}
              y2={offset}
              stroke="#FFFFFF"
            />
          )
        )}
      </g>
      <g className="-y-labels">
        {yTicks.map(
          (
            { value, offset } // 1 map -> 1 rendering
          ) => (
            <text
              key={value}
              x={margins.left - 20}
              y={offset}
              fill="#FFFFFF"
              fontSize={10}
              textAnchor="middle"
            >
              {value}
            </text>
          )
        )}
        <text
          x={margins.left - 20}
          y={margins.top - 10}
          fill="#FFFFFF"
          fontSize={10}
          textAnchor="middle"
        >
          {yLabel}
        </text>
      </g>
    </g>
  )
})
