import { observer } from "mobx-react-lite"
import { useMst } from "../state"
import { scalePoint, scaleOrdinal, scaleSqrt } from "d3-scale"
import { extent } from "d3-array"
import { countBy, groupBy, orderBy, sortBy } from "lodash"
import { useControls } from "leva"
import { makeLayout } from "yogurt-layout"
import { DebugLayout } from "./DebugLayout"
import { TYPES } from "../const"

export const MatrixPlot = observer(() => {
  const mst = useMst()

  const { debug, marginTop, marginRight, marginBottom, marginLeft, scalePadding } = useControls({
    debug: false,
    marginTop: { value: 10, min: 0, max: 100, step: 1 },
    marginRight: { value: 30, min: 0, max: 100, step: 1 },
    marginBottom: { value: 20, min: 0, max: 100, step: 1 },
    marginLeft: { value: 30, min: 0, max: 100, step: 1 },
    scalePadding: { value: 5, min: 0, max: 10, step: 1 },
  })

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

  const groupedTypes = sortBy(Object.entries(countBy(mst.data, "Type 1")))
  const uniqueTypes = groupedTypes.map((type) => type[0])

  const groupedTypesCombo = Object.entries(
    groupBy(mst.data, (d) => `${d["Type 1"]}__${d["Type 2"] ?? d["Type 1"]}`)
  ).map(([k, v]) => ({
    type1: k.split("__")[0],
    type2: k.split("__")[1],
    count: v.length,
    list: v,
  }))

  console.log(groupedTypesCombo)

  const quantityDomain = extent(groupedTypesCombo.map((datum) => datum.count)) as [number, number]

  const radiusScale = scaleSqrt(quantityDomain, [5, 20])

  const xScale = scalePoint(uniqueTypes, [layout.chart.left, layout.chart.right]).padding(
    scalePadding
  )
  const yScale = scalePoint(uniqueTypes, [layout.chart.bottom, layout.chart.top]).padding(
    scalePadding
  )

  const orderedTypesColors = orderBy(TYPES, (t) => t.name).map((t) => t.color)

  const colorScale = scaleOrdinal(uniqueTypes, orderedTypesColors)

  return (
    <section>
      <h1>MatrixPlot</h1>
      <div>
        <p>{groupedTypesCombo.length}</p>
      </div>
      <div id="#scatter-plot">
        <svg height={layout.root.height} width={layout.root.width}>
          {/*Axis*/}
          {uniqueTypes.map((t, i) => {
            return (
              <g key={i} className="-y-axises">
                <text
                  fontSize={10}
                  x={xScale(t)}
                  y={layout.chart.top}
                  fill="#FFFFFF"
                  textAnchor="middle"
                >
                  {t}
                </text>
                <line
                  x1={xScale(t)}
                  x2={xScale(t)}
                  y1={layout.root.top}
                  y2={layout.root.bottom}
                  stroke="#777777"
                />
              </g>
            )
          })}
          {uniqueTypes.map((t, i) => {
            return (
              <g key={i}>
                <text fontSize={15} y={yScale(t)} x={layout.chart.left} fill="#FFFFFF">
                  {t}
                </text>
                <line
                  x1={layout.root.left}
                  x2={layout.root.right}
                  y1={yScale(t)}
                  y2={yScale(t)}
                  stroke="#777777"
                />
              </g>
            )
          })}

          {/* Circles */}
          {groupedTypesCombo.map((datum, index) => {
            return (
              <g key={index}>
                <circle
                  key={index}
                  cx={xScale(datum.type1)}
                  cy={yScale(datum.type2)}
                  r={radiusScale(datum.count)}
                  fill={colorScale(datum.type1)}
                  stroke={colorScale(datum.type2)}
                  strokeWidth="3"
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
