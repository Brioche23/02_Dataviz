import { observer } from "mobx-react-lite"
import { useMst } from "../state"
import { scaleLinear, scaleOrdinal, scaleSqrt } from "d3-scale"
import { extent } from "d3-array"
import { countBy, orderBy } from "lodash"
import { makeLayout } from "yogurt-layout"
import { DebugLayout } from "./DebugLayout"
import { useControls } from "leva"
import { TYPES } from "../const"

export const ScatterPlot = observer(() => {
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
    width: 1000,
    height: 1000,
    padding: {
      top: marginTop,
      right: marginRight,
      bottom: marginBottom,
      left: marginLeft,
    },
    children: [
      {
        id: "chart",
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

  const hpDomain = extent(mst.data.map((datum) => datum.HP)) as [number, number]

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
    xOffset: xScale(value),
  }))
  const yTicks = yScale.ticks().map((value) => ({
    value,
    yOffset: yScale(value),
  }))

  //   console.log(yTicks);

  return (
    <section>
      <h1>ScatterPlot</h1>
      <div id="#scatter-plot">
        <svg height={layout.root.height} width={layout.root.width}>
          {/* X-Axis */}
          <line
            x1={layout.chart.left}
            x2={layout.chart.right}
            y1={layout.chart.bottom}
            y2={layout.chart.bottom}
            stroke="#FFFFFF"
          />
          <g className="-x-ticks">
            {xTicks.map(
              (
                { value, xOffset } // 1 map -> 1 rendering
              ) => (
                // Transform danno problemi -> dubbi su origin degli elementi
                <line
                  key={value}
                  x1={xOffset}
                  x2={xOffset}
                  y1={layout.chart.bottom}
                  y2={layout.chart.bottom + 6}
                  stroke="#FFFFFF"
                />
              )
            )}
          </g>
          <g className="-x-labels">
            {xTicks.map(
              (
                { value, xOffset } // 1 map -> 1 rendering
              ) => (
                <text
                  key={value}
                  x={xOffset}
                  y={layout.chart.bottom + 20}
                  fill="#FFFFFF"
                  fontSize={10}
                  textAnchor="middle"
                >
                  {value}
                </text>
              )
            )}
            <text
              x={layout.chart.right}
              y={layout.chart.bottom + 30}
              fill="#FFFFFF"
              fontSize={10}
              textAnchor="middle"
            >
              Attack
            </text>
          </g>

          {/* Y-Axis */}
          <line
            x1={layout.chart.left}
            x2={layout.chart.left}
            y1={layout.chart.top}
            y2={layout.chart.bottom}
            stroke="#FFFFFF"
          />

          <g className="-y-ticks">
            {yTicks.map(
              (
                { value, yOffset } // 1 map -> 1 rendering
              ) => (
                // Transform danno problemi -> dubbi su origin degli elementi
                <line
                  key={value}
                  x1={layout.chart.left}
                  x2={layout.chart.left - 6}
                  y1={yOffset}
                  y2={yOffset}
                  stroke="#FFFFFF"
                />
              )
            )}
          </g>
          <g className="-y-labels">
            {yTicks.map(
              (
                { value, yOffset } // 1 map -> 1 rendering
              ) => (
                <text
                  key={value}
                  x={layout.chart.left - 20}
                  y={yOffset}
                  fill="#FFFFFF"
                  fontSize={10}
                  textAnchor="middle"
                >
                  {value}
                </text>
              )
            )}
            <text
              x={layout.chart.left - 20}
              y={layout.chart.top - 10}
              fill="#FFFFFF"
              fontSize={10}
              textAnchor="middle"
            >
              Defense
            </text>
          </g>

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
                {/* <text
                  x={xScale(datum.Attack)}
                  y={yScale(datum.Defense)}
                  fill="#DDDDDD"
                >
                  {datum.Name}
                </text> */}
              </g>
            )
          })}
          {debug && <DebugLayout layout={layout} />}
        </svg>
      </div>
    </section>
  )
})
