import { observer } from "mobx-react-lite"
import { useMst } from "../state"
import { scalePoint, scaleOrdinal, scaleSqrt } from "d3-scale"
import { extent } from "d3-array"
import { countBy, groupBy, orderBy, sortBy } from "lodash"
import { useControls } from "leva"
import { makeLayout } from "yogurt-layout"
import { DebugLayout } from "./DebugLayout"
import { TYPES } from "../const"
import { ChartProps } from "../utils/types"
import { Tooltip } from "./Tooltip"

export const MatrixPlot = observer(({ width }: ChartProps) => {
  const mst = useMst()

  const { debug } = useControls({
    debug: true,
  })

  const layout = makeLayout({
    id: "root",
    width: width,
    height: 1000,

    children: [
      { id: "yLabel", width: 75 },
      {
        id: "chartBox",
        direction: "column",
        children: [{ id: "xLabel", height: 40 }, { id: "chart" }],
      },
    ],
  })

  const uniqueTypes = sortBy(Object.entries(countBy(mst.data, "Type 1"))).map((type) => type[0])

  const groupedTypesCombo = Object.entries(
    groupBy(mst.data, (d) => `${d["Type 1"]}__${d["Type 2"] ?? d["Type 1"]}`)
  ).map(([k, v]) => ({
    type1: k.split("__")[0],
    type2: k.split("__")[1],
    count: v.length,
    list: v,
  }))

  // console.log(groupedTypesCombo)

  const quantityDomain = extent(groupedTypesCombo.map((datum) => datum.count)) as [number, number]
  const radiusScale = scaleSqrt(quantityDomain, [5, 20])

  const xScale = scalePoint(uniqueTypes, [layout.chart.left, layout.chart.right])
  const yScale = scalePoint(uniqueTypes, [layout.chart.bottom, layout.chart.top])

  const orderedTypesColors = orderBy(TYPES, (t) => t.name).map((t) => t.color)
  const colorScale = scaleOrdinal(uniqueTypes, orderedTypesColors)

  return (
    <section className="matrix-plot">
      <h1>MatrixPlot</h1>
      <div>
        <p>{groupedTypesCombo.length}</p>
      </div>
      <div>
        <svg height={layout.root.height} width={layout.root.width} overflow={"visible"}>
          {/*Axis*/}
          {uniqueTypes.map((t, i) => {
            return (
              <g key={i} className="-y-axises">
                <text
                  className="-x-label"
                  fontSize={12}
                  x={xScale(t)}
                  y={layout.xLabel.top}
                  fill="#FFFFFF"
                  textAnchor="middle"
                  dominantBaseline={"hanging"}
                >
                  {t}
                </text>
                <line
                  x1={xScale(t)}
                  x2={xScale(t)}
                  y1={layout.chart.top}
                  y2={layout.chart.bottom}
                  stroke="#777777"
                />
              </g>
            )
          })}
          {uniqueTypes.map((t, i) => {
            return (
              <g key={i} className="-x-axises">
                <text fontSize={15} y={yScale(t)} x={layout.yLabel.left} fill="#FFFFFF">
                  {t}
                </text>
                <line
                  x1={layout.chart.left}
                  x2={layout.chart.right}
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
                  onMouseOver={() => mst.setHoveredMatrix(datum)}
                  onMouseLeave={() => mst.setHoveredMatrix(undefined)}
                />
              </g>
            )
          })}
          {debug && <DebugLayout layout={layout} />}
        </svg>

        {mst.hoveredDatumMatrix && (
          <Tooltip>
            {mst.hoveredDatumMatrix.type1 === mst.hoveredDatumMatrix.type2 ? (
              <p>
                <span style={{ color: colorScale(mst.hoveredDatumMatrix.type1) }}>
                  {mst.hoveredDatumMatrix?.type1}
                </span>
              </p>
            ) : (
              <p>
                <span style={{ color: colorScale(mst.hoveredDatumMatrix.type1) }}>
                  {mst.hoveredDatumMatrix?.type1}
                </span>
                <span>/</span>
                <span style={{ color: colorScale(mst.hoveredDatumMatrix.type2) }}>
                  {mst.hoveredDatumMatrix?.type2}
                </span>
              </p>
            )}
            <hr />
            <p>{mst.hoveredDatumMatrix?.count}</p>
            <hr />
            {mst.hoveredDatumMatrix?.list.map((d) => {
              return <p>{d.Name}</p>
            })}
          </Tooltip>
        )}
      </div>
    </section>
  )
})
