import { observer } from "mobx-react-lite"
import { ScaleBand, ScaleOrdinal, ScaleRadial } from "d3-scale"
import { Dictionary, isNil } from "lodash"
import { makeLayout } from "yogurt-layout"
import { DebugLayout } from "./DebugLayout"
import { useControls } from "leva"

import { RadarVariable } from "../utils/types"
import { lineRadial } from "d3"
import { PokemonDatum } from "../api"
import { useComponentSize } from "react-use-size"
import { RadarGrid } from "./RadarGrid"

type AxisConfig = {
  name: RadarVariable
  max: number
}

export type RadarProps = {
  data: PokemonDatum
  axisConfig: AxisConfig[]
  scales: {
    xScale: ScaleBand<string>
    yScales: Dictionary<ScaleRadial<number, number, never>>
    colorScale: ScaleOrdinal<string, string, never>
  }
}

export const RadarChart = observer(({ data, axisConfig, scales }: RadarProps) => {
  const { ref, height, width } = useComponentSize()
  const { debug } = useControls({
    debug: true,
  })

  console.log("height", height)
  console.log("width", width)

  const { root, chart, label } = makeLayout({
    id: "root",
    width: width,
    height: height,
    padding: {
      right: 0,
    },
    direction: "column",
    children: [
      {
        id: "label",
        height: 20,
        padding: {
          left: 20,
        },
      },
      {
        id: "chart",
      },
    ],
  })

  const lineGenerator = lineRadial()
  const rad = Math.min(chart.height, chart.width) / 2

  const allCoordinates = axisConfig.map((axis) => {
    const yScale = scales.yScales[axis.name]
    const angle = scales.xScale(axis.name) ?? 0 // I don't understand the type of scalePoint. IMO x cannot be undefined since I'm passing it something of type Variable.
    const radius = yScale(data[axis.name]) * rad
    const coordinate: [number, number] = [angle, radius]
    return coordinate
  })

  allCoordinates.push(allCoordinates[0])
  const linePath = lineGenerator(allCoordinates)

  return (
    <section className="radar" ref={ref}>
      <div
        className="radar-chart"
        style={{ position: "relative", outline: "0px solid purple", height: height || 150 }}
      >
        <div
          style={{
            position: "absolute",
            fontSize: 10,
            top: label.top,
            left: label.left,
          }}
        >
          <p>
            {data["#"]}–{data.Name}
          </p>
        </div>

        <svg height={root.height} width={root.width} overflow={"visible"}>
          <g
            transform={`translate(${chart.left + chart.width / 2}, ${
              chart.top + chart.height / 2
            })`}
          >
            <RadarGrid outerRadius={rad} xScale={scales.xScale} axisConfig={axisConfig} />

            {!isNil(linePath) && (
              <path
                d={linePath}
                // stroke={"#cb1dd1"}
                strokeWidth={3}
                fill={scales.colorScale(data["Type 1"])}
                fillOpacity={0.7}
              />
            )}
          </g>
          {debug && <DebugLayout layout={{ root, chart, label }} />}
        </svg>
      </div>
    </section>
  )
})
