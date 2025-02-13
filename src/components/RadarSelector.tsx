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
import { includes, isNil } from "lodash"
import { PokemonDatum } from "../api"

interface LabelProps {
  pokemon: PokemonDatum | undefined
}

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
        {mst.selectedPokemonIds.map((i) => {
          return <PokemonSelectionLabel key={i} pokemon={mst.data[i]} />
        })}
      </div>
      <div className={styles["selector-wrapper"]}>
        <div
          className={styles["pokemon-list-wrapper"]}
          style={{ width: layout.pokemonList.width, height: layout.root.height }}
        >
          <div className={styles["label-wrapper"]}>
            <input
              type="text"
              name="pokemon"
              placeholder="Name or type of Pokemon"
              className={styles["search-bar"]}
              onChange={(e) => mst.setSearchValue(e.target.value)}
            />
          </div>
          <div className={styles["pokemon-list"]} style={{ overflow: "scroll" }}>
            {mst.searchedData.map(
              (datum, i) => datum?.Name && <PokemonSelectionLabel key={i} pokemon={datum} />
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

const PokemonSelectionLabel = ({ pokemon }: LabelProps) => {
  const mst = useMst()
  if (!isNil(pokemon?.id))
    return (
      <div
        className={classNames(
          styles["label-wrapper"],
          includes(mst.selectedPokemonIds, pokemon.id) ? styles.active : ""
        )}
      >
        <div
          key={pokemon.id}
          className={classNames(
            styles.label,
            includes(mst.selectedPokemonIds, pokemon.id) ? styles.active : ""
          )}
          onClick={() => {
            mst.setSelectedPokemonId(pokemon.id)
          }}
        >
          <p>
            {pokemon.Name} <span>{pokemon.Legendary && "⭐️"}</span>
          </p>
        </div>
        <button
          className={classNames(
            styles["compare-button"],
            mst.selectedPokemonIds.length === 1 && includes(mst.selectedPokemonIds, pokemon.id)
              ? styles.disabled
              : ""
          )}
          onClick={() => {
            if (mst.selectedPokemonIds.length === 1) {
              if (!includes(mst.selectedPokemonIds, pokemon.id))
                mst.toggleSelectedPokemonId(pokemon.id)
            } else mst.toggleSelectedPokemonId(pokemon.id)
          }}
        >
          {includes(mst.selectedPokemonIds, pokemon.id) ? "-" : "+"}
        </button>
      </div>
    )
}
