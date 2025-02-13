import { observer } from "mobx-react-lite"
import { useMst } from "../state"
import { scaleLinear, scaleOrdinal, scaleSqrt } from "d3-scale"
import { extent } from "d3-array"
import { countBy, includes, isNil, orderBy } from "lodash"
import { makeLayout } from "yogurt-layout"
import { DebugLayout } from "./DebugLayout"
import { useControls } from "leva"
import { TYPES, REGIONS } from "../const"
import { ChartProps } from "../utils/types"
import { Tooltip } from "./Tooltip"
import { XAxis } from "./XAxis"
import { YAxis } from "./YAxis"

import styles from "./ScatterPlot.module.css"
import classNames from "classnames"
import { RegionFilter } from "./RegionFilter"

export const ScatterPlot = observer(({ width }: ChartProps) => {
  const mst = useMst()

  const { debug, marginRight } = useControls({
    debug: true,
    marginTop: { value: 10, min: 0, max: 100, step: 1 },
    marginRight: { value: 30, min: 0, max: 100, step: 1 },
    marginBottom: { value: 20, min: 0, max: 100, step: 1 },
    marginLeft: { value: 30, min: 0, max: 100, step: 1 },
  })

  const layout = makeLayout({
    id: "root",
    width: width,
    height: 1000,
    padding: {
      right: marginRight,
    },
    children: [
      {
        id: "yLabel",
        width: 50,
      },
      {
        id: "",
        direction: "column",
        children: [{ id: "chart" }, { id: "xLabel", height: 35 }],
      },
    ],
  })

  // console.log("Yogurt", layout);

  const attackValuesDomain = extent(mst.data.map((datum) => datum.Attack).concat([0])) as [
    number,
    number
  ]

  const defenseValuesDomain = extent(mst.data.map((datum) => datum.Defense).concat([0])) as [
    number,
    number
  ]

  const hpDomain = extent(mst.data.map((datum) => datum["HP"])) as [number, number]

  const groupedTypes = Object.entries(countBy(mst.data, "Type 1"))
  const uniqueTypes = orderBy(groupedTypes.map((type) => type[0]))

  const xScale = scaleLinear(attackValuesDomain, [layout.chart.left, layout.chart.right]).nice(10)

  const yScale = scaleLinear()
    .domain(defenseValuesDomain)
    .range([layout.chart.bottom, layout.chart.top])
    .nice(10)

  const radiusScale = scaleSqrt(hpDomain, [2, 12])

  const orderedTypesColors = orderBy(TYPES, (t) => t.name).map((t) => t.color)

  const coloScale = scaleOrdinal(uniqueTypes, orderedTypesColors)

  const xTicks = xScale.ticks().map((value) => ({
    value,
    offset: xScale(value),
  }))
  const yTicks = yScale.ticks().map((value) => ({
    value,
    offset: yScale(value),
  }))

  //   console.log(yTicks);

  return (
    <section className="scatter-plot">
      <h1>ScatterPlot</h1>

      <RegionFilter />

      <div className="#scatter-plot">
        <svg height={layout.root.height} width={layout.root.width} overflow={"visible"}>
          <XAxis margins={layout.chart} xTicks={xTicks} xLabel="Attack" />
          <YAxis margins={layout.chart} yTicks={yTicks} yLabel="Defense" />

          {/* Circles */}
          {mst.filteredByGenerationData.map((datum, index) => {
            if (!isNil(datum))
              return (
                <g key={index}>
                  <circle
                    key={index}
                    cx={xScale(datum.Attack)}
                    cy={yScale(datum.Defense)}
                    r={radiusScale(datum.HP)}
                    fill={coloScale(datum["Type 1"])}
                    // opacity={15 * datum.Generation + "%"}
                    onMouseOver={() => mst.setHoveredScatterPlot(datum)}
                    onMouseLeave={() => mst.setHoveredScatterPlot(undefined)}
                  />
                </g>
              )
          })}
          {debug && <DebugLayout layout={layout} />}
        </svg>

        {mst.hoveredDatumScatterPlot && (
          <Tooltip>
            <p>{mst.hoveredDatumScatterPlot?.Name}</p>
            <table>
              <thead>
                <tr>
                  <td>Atk</td>
                  <td>Def</td>
                  <td>HP</td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{mst.hoveredDatumScatterPlot?.Attack}</td>
                  <td>{mst.hoveredDatumScatterPlot?.Defense}</td>
                  <td>{mst.hoveredDatumScatterPlot?.HP}</td>
                </tr>
              </tbody>
            </table>
          </Tooltip>
        )}
      </div>
    </section>
  )
})
