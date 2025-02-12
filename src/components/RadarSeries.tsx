import { observer } from "mobx-react-lite"
import { useMst } from "../state"
import { scaleBand, scaleOrdinal, scaleRadial } from "d3-scale"
import { max } from "d3-array"
import { includes, isNil, keyBy, mapValues } from "lodash"
import { TYPES, REGIONS } from "../const"
import { ChartProps } from "../utils/types"

import styles from "./RadarSeries.module.css"
import classNames from "classnames"

import { RadarVariable } from "../utils/types"
import { RadarChart } from "./RadarChart"

export const RadarSeries = observer(({ width }: ChartProps) => {
  const mst = useMst()

  const RADAR_VARIABLES: RadarVariable[] = [
    "HP",
    "Attack",
    "Defense",
    "Sp. Atk",
    "Sp. Def",
    "Speed",
  ]

  const axisConfig = RADAR_VARIABLES.map((v) => ({
    name: v,
    max: max(mst.data.map((datum) => datum[v]).concat([0])) as number,
  }))

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

  //   console.log(orderedTypesColors)

  const colorScale = scaleOrdinal(uniqueTypes, orderedTypesColors)

  const scales = {
    xScale: xScale,
    yScales: yScales,
    colorScale: colorScale,
  }

  return (
    <section className="radar">
      <h1>Radar Chart</h1>
      <div className={styles.filter}>
        {REGIONS.map((r, i) => {
          return (
            <button
              key={i}
              onClick={() => mst.toggleFilters(r.gen)}
              className={classNames(
                styles["filter-chip"],
                includes(mst.generationFilter, r.gen) ? styles.active : ""
              )}
            >
              {r.region}
            </button>
          )
        })}
      </div>
      <div className={styles["radar-grid"]} style={{ width: width }}>
        {mst.filteredScatterPlotData.map((datum, i) => {
          if (!isNil(datum))
            return (
              <RadarChart
                key={i}
                data={datum}
                // width={100}
                // height={100}
                axisConfig={axisConfig}
                scales={scales}
              />
            )
        })}
      </div>
    </section>
  )
})
