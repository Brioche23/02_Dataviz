import { observer } from "mobx-react-lite"
import { useMst } from "../state"
import { scaleBand, scaleLinear, scaleOrdinal } from "d3-scale"
import { extent } from "d3-array"
import { countBy, groupBy, keyBy, mapValues, orderBy, toNumber } from "lodash"
import { useControls } from "leva"
import { makeLayout } from "yogurt-layout"
import { DebugLayout } from "./DebugLayout"
import { TYPES } from "../const"
import { Axes } from "./Axes"
import { stack, stackOrderNone } from "d3"
import { ChartProps } from "../utils/types"

type Group = {
  gen: number
} & { [key: string]: number }

export const StackedBarChart = observer(({ width }: ChartProps) => {
  const mst = useMst()

  const { debug, marginRight } = useControls({
    debug: false,
    // marginTop: { value: 10, min: 0, max: 100, step: 1 },
    marginRight: { value: 30, min: 0, max: 100, step: 1 },
    // marginBottom: { value: 20, min: 0, max: 100, step: 1 },
    // marginLeft: { value: 30, min: 0, max: 100, step: 1 },
    // scalePadding: { value: 10, min: 0, max: 10, step: 1 },
  })

  const layout = makeLayout({
    id: "root",
    width: width,
    height: 1000,
    padding: { right: marginRight },
    children: [
      { id: "yLabel", width: 50 },
      {
        id: "",
        direction: "column",
        children: [{ id: "chart" }, { id: "xLabel", height: 35 }],
      },
    ],
  })

  const groupedTypes = Object.entries(countBy(mst.data, "Type 1"))
  const uniqueTypes = orderBy(groupedTypes.map((type) => type[0]))
  // console.log("uniqueTypes", uniqueTypes)

  const groupsByGen = groupBy(mst.data, (d) => d.Generation)
  // console.log("groupsByGen", groupsByGen)

  const typeTemplate = Object.fromEntries(uniqueTypes.map((type) => [type, 0]))
  // console.log("typeTemplate", typeTemplate)

  const typesPerGen = Object.entries(
    groupBy(mst.data, (d) => `${d["Generation"]}__${d["Type 1"]}`)
  ).map(([k, v]) => ({
    gen: k.split("__")[0],
    type: k.split("__")[1],
    count: v.length,
    // list: v,
  }))

  // console.log("typesPerGen", typesPerGen)

  const groupTypesPerGen: Group[] = Object.entries(groupBy(typesPerGen, (t) => t.gen)).map(
    ([gen, types]) => {
      const newObject: { [key: string]: number } = mapValues(keyBy(types, "type"), "count")
      return {
        gen: toNumber(gen),
        ...typeTemplate, // This adds all types with 0
        ...newObject,
      }
    }
  )

  const generationGroups = orderBy(groupTypesPerGen.map((datum) => datum.gen))
  const generationDomain = extent(generationGroups.concat(0)) as [number, number]

  const verticalDomain = extent(
    Object.entries(groupsByGen)
      .map((g) => g[1].length)
      .concat([0])
  ) as [number, number]
  console.log("VD", verticalDomain)

  const stackSeries = stack().keys(uniqueTypes).order(stackOrderNone)
  const series = stackSeries(groupTypesPerGen)

  const xScale = scaleBand(generationGroups, [layout.chart.left, layout.chart.right]).padding(0.05)

  const xScaleLinear = scaleLinear(generationDomain, [layout.chart.left, layout.chart.right])

  const yScale = scaleLinear()
    .domain(verticalDomain)
    .range([layout.chart.bottom, layout.chart.top])
    .nice(10)

  const orderedTypesColors = orderBy(TYPES, (t) => t.name).map((t) => t.color)

  const colorScale = scaleOrdinal(uniqueTypes, orderedTypesColors)

  const xTicks = xScaleLinear.ticks().map((value) => ({
    value: value + 0.5,
    offset: xScaleLinear(value),
  }))

  const yTicks = yScale.ticks().map((value) => ({
    value,
    offset: yScale(value),
  }))

  return (
    <section>
      <h1>Stacked Bar Chart</h1>
      <div id="#scatter-plot">
        <svg height={layout.root.height} width={layout.root.width} overflow={"visible"}>
          <Axes
            margins={layout.chart}
            xTicks={xTicks}
            yTicks={yTicks}
            xLabel="Generation"
            yLabel="Sum"
          />

          {/* Circles */}
          {series.map((subgroup, index) => {
            return (
              <g key={index}>
                {subgroup.map((group, j) => {
                  return (
                    <rect
                      key={j}
                      x={xScale(group.data.gen)}
                      y={yScale(group[1])}
                      width={xScale.bandwidth()}
                      height={yScale(group[0]) - yScale(group[1])}
                      fill={colorScale(subgroup.key)}
                    />
                  )
                })}
              </g>
            )
          })}
          {debug && <DebugLayout layout={layout} />}
        </svg>
      </div>
    </section>
  )
})
