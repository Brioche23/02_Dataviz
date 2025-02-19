import { observer } from "mobx-react-lite"
import { useMst } from "../state"
import { scaleBand, scaleLinear, scaleOrdinal } from "d3-scale"
import { extent } from "d3-array"
import { countBy, groupBy, keyBy, mapValues, orderBy, toNumber } from "lodash"
import { useControls } from "leva"
import { makeLayout } from "yogurt-layout"
import { DebugLayout } from "./DebugLayout"
import { TYPES } from "../const"
import { stack, stackOrderNone } from "d3"
import { ChartProps } from "../utils/types"
import styles from "./StackedBarChart.module.css"
import { Tooltip } from "./Tooltip"
import { YAxis } from "./YAxis"
import { XAxis } from "./XAxis"

type Group = {
  gen: number
} & { [key: string]: number }

export const StackedBarChart = observer(({ width }: ChartProps) => {
  const mst = useMst()

  const { debug, marginRight } = useControls({
    debug: false,
    marginRight: { value: 30, min: 0, max: 100, step: 1 },
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

  const groupsByGen = groupBy(mst.data, (d) => d.Generation)

  const typeTemplate = Object.fromEntries(uniqueTypes.map((type) => [type, 0]))

  const typesPerGen = Object.entries(
    groupBy(mst.data, (d) => `${d["Generation"]}__${d["Type 1"]}`)
  ).map(([k, v]) => ({
    gen: k.split("__")[0],
    type: k.split("__")[1],
    count: v.length,
    // list: v,
  }))

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

  const verticalDomain = extent(
    Object.entries(groupsByGen)
      .map((g) => g[1].length)
      .concat([0])
  ) as [number, number]
  console.log("VD", verticalDomain)

  const stackSeries = stack().keys(uniqueTypes).order(stackOrderNone)
  const series = stackSeries(groupTypesPerGen)

  const xScale = scaleBand(generationGroups, [layout.chart.left, layout.chart.right]).padding(0.05)

  const yScale = scaleLinear()
    .domain(verticalDomain)
    .range([layout.chart.bottom, layout.chart.top])
    .nice(10)

  const orderedTypesColors = orderBy(TYPES, (t) => t.name).map((t) => t.color)

  const colorScale = scaleOrdinal(uniqueTypes, orderedTypesColors)

  const xTicks = generationGroups.map((value) => {
    const scaledValue = xScale(value)

    // Provide a fallback if scaledValue is undefined
    if (scaledValue === undefined) {
      console.warn(`xScale returned undefined for value: ${value}`)
      return {
        value,
        offset: 0, // or some default value
      }
    }

    return {
      value,
      offset: scaledValue + xScale.bandwidth() / 2,
    }
  })

  const yTicks = yScale.ticks().map((value) => ({
    value,
    offset: yScale(value),
  }))

  return (
    <section>
      <h1>Stacked Bar Chart</h1>
      <div className="-scatter-plot">
        <svg height={layout.root.height} width={layout.root.width} overflow={"visible"}>
          <XAxis margins={layout.chart} xTicks={xTicks} xLabel="Generation" />
          <YAxis margins={layout.chart} yTicks={yTicks} yLabel="Pokemons" />

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
                      className={styles.rect}
                      onMouseOver={() =>
                        mst.setHoveredStack({
                          type: subgroup.key,
                          count: group.data[subgroup.key],
                        })
                      }
                      onMouseLeave={() => mst.setHoveredStack(undefined)}
                    />
                  )
                })}
              </g>
            )
          })}
          {debug && <DebugLayout layout={layout} />}
        </svg>

        {mst.hoveredDatumStack && (
          <Tooltip>
            <p>
              <span className="-title">{mst.hoveredDatumStack?.type}</span>
              <span>:</span>
              <span>{mst.hoveredDatumStack?.count}</span>
            </p>
          </Tooltip>
        )}
      </div>
    </section>
  )
})
