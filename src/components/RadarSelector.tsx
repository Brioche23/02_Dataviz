import { observer } from "mobx-react-lite"
import { useMst } from "../state"
import { makeLayout } from "yogurt-layout"
import { ChartProps } from "../utils/types"
import { useControls } from "leva"

import { max } from "d3-array"
import { RadarChartAnimated } from "./RadarChartAnimated"
import { RADAR_VARIABLES } from "../const"
import styles from "./RadarSelector.module.css"
import classNames from "classnames"
import { RegionFilter } from "./RegionFilter"

export const RadarSelector = observer(({ width }: ChartProps) => {
  const { debug } = useControls({
    debug: true,
    // marginRight: { value: 30, min: 0, max: 100, step: 1 },
  })
  const mst = useMst()

  const layout = makeLayout({
    id: "root",
    width: width,
    height: 800,
    direction: "row",

    children: [
      { id: "pokemonList", width: 300 },
      {
        id: "radarWrapper",
      },
    ],
  })

  const axisConfig = RADAR_VARIABLES.map((v) => ({
    name: v,
    max: max(mst.data.map((datum) => datum[v]).concat([0])) as number,
  }))

  return (
    <section>
      <RegionFilter />

      <div className={styles["selector-wrapper"]}>
        <div className="pokemon-list" style={{ height: layout.root.height, overflow: "scroll" }}>
          {mst.filteredScatterPlotData.map(
            (datum, i) =>
              datum?.Name && (
                <p
                  key={i}
                  className={classNames(
                    styles.label,
                    i === mst.selectedPokemonIndex ? styles.active : ""
                  )}
                  onClick={() => mst.setSelectedPokemonIndex(i)}
                >
                  {datum?.Name}
                </p>
              )
          )}
        </div>
        <div className="radar" style={{ width: layout.radarWrapper.width }}>
          <RadarChartAnimated
            data={mst.data[mst.selectedPokemonIndex]}
            width={layout.radarWrapper.width}
            height={layout.radarWrapper.height}
            axisConfig={axisConfig}
          />
        </div>
      </div>
    </section>
  )
})
