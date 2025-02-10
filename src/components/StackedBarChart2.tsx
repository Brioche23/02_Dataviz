import React from "react"
import { observer } from "mobx-react-lite"
import { useMst } from "../state"
import { scaleBand, scaleLinear, scaleOrdinal } from "d3-scale"
import { extent } from "d3-array"
import { orderBy } from "lodash"
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

export const StackedBarChart2 = observer(({ width }: ChartProps) => {
  const mst = useMst()

  const { debug, marginTop, marginRight, marginBottom, marginLeft, scalePadding } = useControls({
    debug: false,
    marginTop: { value: 10, min: 0, max: 100, step: 1 },
    marginRight: { value: 30, min: 0, max: 100, step: 1 },
    marginBottom: { value: 20, min: 0, max: 100, step: 1 },
    marginLeft: { value: 30, min: 0, max: 100, step: 1 },
    scalePadding: { value: 10, min: 0, max: 10, step: 1 },
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

  // Create a single Map for types to track counts - O(N)
  const typeCountMap = new Map<string, Map<number, number>>()
  const generationSet = new Set<number>()

  // Single pass through the data to build our maps - O(N)
  mst.data.map((datum) => {
    const gen = Number(datum.Generation)
    const type = datum["Type 1"]
    generationSet.add(gen)

    if (!typeCountMap.has(type)) {
      typeCountMap.set(type, new Map())
    }

    const genMap = typeCountMap.get(type)!
    genMap.set(gen, (genMap.get(gen) || 0) + 1)
  })

  // Convert sets to sorted arrays - O(K log K) where K is number of unique types/generations
  // This is effectively O(1) since K is small and constant
  const uniqueTypes = Array.from(typeCountMap.keys()).sort()
  const generations = Array.from(generationSet).sort()
  const generationDomain = extent(generations) as [number, number]

  // Create the normalized data structure - O(K² + N) where K is small
  const groupTypesPerGen: Group[] = generations.map((gen) => {
    const baseObj: Group = { gen }
    uniqueTypes.forEach((type) => {
      const typeMap = typeCountMap.get(type)
      baseObj[type] = typeMap?.get(gen) || 0
    })
    return baseObj
  })

  // Create stack generator and generate series - O(K²) where K is small
  const stackSeries = stack<Group>().keys(uniqueTypes).order(stackOrderNone)

  const series = stackSeries(groupTypesPerGen)

  // Calculate maximum total for y scale - O(K²) where K is small
  const yMax = Math.max(
    ...groupTypesPerGen.map((g) => uniqueTypes.reduce((sum, type) => sum + (g[type] || 0), 0))
  )

  // Set up scales - All O(1)
  const xScale = scaleBand(generations, [layout.chart.left, layout.chart.right]).padding(0.1)

  const yScale = scaleLinear()
    .domain([0, yMax])
    .range([layout.chart.bottom, layout.chart.top])
    .nice()

  const orderedTypesColors = orderBy(TYPES, (t) => t.name).map((t) => t.color)
  const colorScale = scaleOrdinal(uniqueTypes, orderedTypesColors)

  // Generate tick values - O(K) where K is small
  const xTicks = generations.map((value) => ({
    value,
    offset: xScale(value)! + xScale.bandwidth() / 2,
  }))

  const yTicks = yScale.ticks().map((value) => ({
    value,
    offset: yScale(value),
  }))

  return (
    <section>
      <h1>Stacked Bar Chart</h1>
      <div id="stacked-bar-chart">
        <svg height={layout.root.height} width={layout.root.width} overflow="visible">
          <Axes
            margins={layout.chart}
            xTicks={xTicks}
            yTicks={yTicks}
            xLabel="Generation"
            yLabel="Count"
          />

          {/* Render series - O(K²) where K is small and constant */}
          {series.map((subgroup, index) => (
            <g key={subgroup.key} fill={colorScale(subgroup.key)}>
              {subgroup.map((group, j) => (
                <rect
                  key={`${subgroup.key}-${group.data.gen}`}
                  x={xScale(group.data.gen)}
                  y={yScale(group[1])}
                  width={xScale.bandwidth()}
                  height={yScale(group[0]) - yScale(group[1])}
                />
              ))}
            </g>
          ))}
          {debug && <DebugLayout layout={layout} />}
        </svg>
      </div>
    </section>
  )
})
