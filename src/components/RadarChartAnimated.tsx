import { observer } from "mobx-react-lite"
import { scaleBand, scaleOrdinal, scaleRadial } from "d3-scale"
import { isNil, keyBy, mapValues } from "lodash"
import { makeLayout } from "yogurt-layout"
import { DebugLayout } from "./DebugLayout"
import { useControls } from "leva"

import { RadarVariable } from "../utils/types"
import { lineRadial } from "d3"
import { RadarGrid } from "./RadarGrid"
import { RADAR_VARIABLES, TYPES } from "../const"

import styles from "./RadarChartAnimated.module.css"
import { useMst } from "../state"

type AxisConfig = {
  name: RadarVariable
  max: number
}

type RadarProps = {
  // data: PokemonDatum
  axisConfig: AxisConfig[]
  width: number
  height: number
}

export const RadarChartAnimated = observer(({ width, height, axisConfig }: RadarProps) => {
  const mst = useMst()

  const { debug } = useControls({
    debug: true,
  })

  console.log("height", height)
  console.log("width", width)

  const { root, chart } = makeLayout({
    id: "root",
    width: width,
    height: height,
    padding: {
      right: 0,
    },
    direction: "column",
    children: [
      {
        id: "chart",
      },
    ],
  })

  const xScale = scaleBand()
    .domain(RADAR_VARIABLES)
    .range([0, 2 * Math.PI])

  const yScalesObjects = axisConfig.map((axis) => ({
    key: axis.name,
    yScale: scaleRadial().domain([0, axis.max]).range([0, 1]),
  }))

  const yScales = mapValues(keyBy(yScalesObjects, "key"), "yScale")

  const orderedTypesColors = TYPES.map((t) => t.color)
  const uniqueTypes = TYPES.map((t) => t.name)

  console.log(orderedTypesColors)
  console.log(uniqueTypes)

  const colorScale = scaleOrdinal(uniqueTypes, orderedTypesColors)

  const lineGenerator = lineRadial()
  const rad = Math.min(chart.height, chart.width) / 2

  const allCoordinates = mst.filteredRadarPlotData.map((data) =>
    axisConfig.map((axis) => {
      const yScale = yScales[axis.name]
      const angle = xScale(axis.name) ?? 0 // I don't understand the type of scalePoint. IMO x cannot be undefined since I'm passing it something of type Variable.
      const radius = !isNil(data) ? yScale(data[axis.name]) * rad : 0
      const coordinate: [number, number] = [angle, radius]
      return coordinate
    })
  )
  console.log("daCo", allCoordinates)
  allCoordinates.map((c) => c.push(c[0]))
  const linePaths = allCoordinates.map((c) => lineGenerator(c))

  return (
    <section style={{ position: "absolute" }}>
      <div
        className="radar-chart"
        style={{ position: "relative", outline: "0px solid purple", height: height }}
      >
        <svg height={root.height} width={root.width} overflow={"visible"}>
          <g
            transform={`translate(${chart.left + chart.width / 2}, ${
              chart.top + chart.height / 2
            })`}
          >
            <RadarGrid outerRadius={rad} xScale={xScale} axisConfig={axisConfig} />

            {linePaths.map(
              (path, i) =>
                !isNil(path) && (
                  <path
                    key={i}
                    className={styles["animated-path"]}
                    d={path}
                    stroke={colorScale(mst.filteredRadarPlotData[i]?.["Type 1"].toLowerCase())}
                    strokeWidth={3}
                    fill={colorScale(mst.filteredRadarPlotData[i]?.["Type 1"].toLowerCase())}
                    fillOpacity={0.5}
                  />
                )
            )}
          </g>
          {debug && <DebugLayout layout={{ root, chart }} />}
        </svg>
      </div>
    </section>
  )
})
