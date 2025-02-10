import { observer } from "mobx-react-lite"
import { useMst } from "../state"
import { scaleLinear, scaleOrdinal, scaleSqrt } from "d3-scale"
import { extent } from "d3-array"
import { countBy, orderBy } from "lodash"
import { makeLayout } from "yogurt-layout"
import { DebugLayout } from "./DebugLayout"
import { useControls } from "leva"
import { TYPES } from "../const"
import { Axes } from "./Axes"
import { ChartProps } from "../utils/types"

export const ScatterPlot = observer(({ width }: ChartProps) => {
  const mst = useMst()

  const { debug, marginTop, marginRight, marginBottom, marginLeft } = useControls({
    debug: false,
    marginTop: { value: 10, min: 0, max: 100, step: 1 },
    marginRight: { value: 30, min: 0, max: 100, step: 1 },
    marginBottom: { value: 20, min: 0, max: 100, step: 1 },
    marginLeft: { value: 30, min: 0, max: 100, step: 1 },
  })

  //   console.log("Debug", debug);

  const layout = makeLayout({
    id: "root",
    width: width,
    height: 1000,
    padding: {
      //   top: marginTop,
      right: marginRight,
      //   bottom: marginBottom,
      //   left: marginLeft,
    },
    children: [
      {
        id: "yLabel",
        width: 50,
      },
      {
        id: "",
        direction: "column",
        children: [
          {
            id: "chart",
          },
          {
            id: "xLabel",
            height: 35,
          },
        ],
      },
    ],
  })

  //   console.log("Yogurt", layout);

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
    <section>
      <h1>ScatterPlot</h1>
      <div id="#scatter-plot">
        <svg height={layout.root.height} width={layout.root.width} overflow={"visible"}>
          <Axes
            margins={layout.chart}
            xTicks={xTicks}
            yTicks={yTicks}
            xLabel="Attack"
            yLabel="Defense"
          />

          {/* Circles */}
          {mst.data.map((datum, index) => {
            // if (datum.Generation === 2)
            return (
              <g key={index}>
                <circle
                  key={index}
                  cx={xScale(datum.Attack)}
                  cy={yScale(datum.Defense)}
                  r={radiusScale(datum.HP)}
                  fill={coloScale(datum["Type 1"])}
                  opacity={15 * datum.Generation + "%"}
                />
              </g>
            )
          })}
          {debug && <DebugLayout layout={layout} />}
        </svg>
      </div>
    </section>
  )
})
