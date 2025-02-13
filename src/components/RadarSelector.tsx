import { observer } from "mobx-react-lite"
import { useMst } from "../state"
import { makeLayout } from "yogurt-layout"
import { ChartProps } from "../utils/types"

import { max } from "d3-array"
import { RadarChartAnimated } from "./RadarChartAnimated"
import { RADAR_VARIABLES } from "../const"
import styles from "./RadarSelector.module.css"
import classNames from "classnames"
import { RegionFilter } from "./RegionFilter"
import { includes } from "lodash"

export const RadarSelector = observer(({ width }: ChartProps) => {
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
      <h1>Radar Selection</h1>
      <RegionFilter />

      <div className={styles["selected-pokemons"]}>
        {mst.selectedPokemonIndex.map((i) => {
          return <PokemonSelectionLabel key={i} name={mst.data[i].Name} i={i} />
        })}
      </div>
      <div className={styles["selector-wrapper"]}>
        <div className="pokemon-list" style={{}}>
          <div className={styles["label-wrapper"]}>
            <input
              type="text"
              name="pokemon"
              placeholder="Name or type of Pokemon"
              className={styles["search-bar"]}
              onChange={(e) => mst.setSearchValue(e.target.value)}
            />
          </div>
          <div style={{ height: layout.root.height, overflow: "scroll" }}>
            {mst.searchedData.map(
              (datum, i) => datum?.Name && <PokemonSelectionLabel key={i} name={datum.Name} i={i} />
            )}
          </div>
        </div>
        <div className="radar" style={{ width: layout.radarWrapper.width }}>
          <RadarChartAnimated
            width={layout.radarWrapper.width}
            height={layout.radarWrapper.height}
            axisConfig={axisConfig}
          />
        </div>
      </div>
    </section>
  )
})

interface LabelProps {
  name: string
  i: number
}

const PokemonSelectionLabel = ({ name, i }: LabelProps) => {
  const mst = useMst()
  return (
    <div
      className={classNames(
        styles["label-wrapper"],
        includes(mst.selectedPokemonIndex, i) ? styles.active : ""
      )}
    >
      <div
        key={i}
        className={classNames(
          styles.label,
          includes(mst.selectedPokemonIndex, i) ? styles.active : ""
        )}
        onClick={() => {
          mst.setSelectedPokemonIndex(i)
        }}
      >
        <p>{name}</p>
      </div>
      <button
        onClick={() => {
          if (mst.selectedPokemonIndex.length === 1) {
            if (!includes(mst.selectedPokemonIndex, i)) mst.toggleSelectedPokemonIndex(i)
          } else mst.toggleSelectedPokemonIndex(i)
        }}
      >
        {includes(mst.selectedPokemonIndex, i) ? "-" : "+"}
      </button>
    </div>
  )
}
