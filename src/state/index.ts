import { includes, isNil, xor } from "lodash"
import { Instance, t } from "mobx-state-tree"
import { fetchPokemon, PokemonDatum } from "../api"
import { IReactionDisposer } from "mobx"
import { createContext, useContext } from "react"
import { MatrixDatum, StackDatum } from "../utils/types"

const lifeCycle =
  <T>(func: (self: T) => IReactionDisposer | void) =>
  (self: T) => {
    let disposer: IReactionDisposer | void
    return {
      afterCreate() {
        disposer = func(self)
      },
      beforeDestroy() {
        console.log("Destroy")
        disposer?.()
      },
    }
  }

export const RootModel = t
  .model("RootModel", {
    data: t.optional(t.frozen<PokemonDatum[]>(), []),
    hoveredDatumScatterPlot: t.optional(t.frozen<PokemonDatum | undefined>(), undefined),
    hoveredDatumMatrix: t.optional(t.frozen<MatrixDatum | undefined>(), undefined),
    hoveredDatumStack: t.optional(t.frozen<StackDatum | undefined>(), undefined),
    generationFilter: t.optional(t.frozen<number[]>(), []),
    selectedPokemonIds: t.optional(t.frozen<number[]>(), [0]),
    searchValue: t.optional(t.string, ""),
  })
  .views((self) => ({
    get columns() {
      return Object.keys(self.data?.[0] ?? {}) as (keyof PokemonDatum)[]
    },
    get filteredByGenerationData() {
      if (self.generationFilter.length === 0) return self.data
      return self.data.filter((d) => includes(self.generationFilter, d.Generation))
    },
    get filteredRadarPlotData() {
      if (self.selectedPokemonIds.length === 0) return self.data
      return self.data.filter((d) => includes(self.selectedPokemonIds, d.id))
    },
  }))
  .views((self) => ({
    get searchedData() {
      if (self.searchValue.length > 0)
        return self.filteredByGenerationData.filter(
          (d) =>
            includes(d?.Name.toLowerCase(), self.searchValue.toLowerCase()) ||
            includes(d?.["Type 1"].toLowerCase(), self.searchValue.toLowerCase())
        )
      return self.filteredByGenerationData
    },
  }))
  .actions((self) => ({
    setData(newData: PokemonDatum[]) {
      self.data = newData
    },
    toggleRegionFilters(filter: number) {
      const newFilters = xor(self.generationFilter, [filter])
      self.generationFilter = newFilters
    },
    setHoveredScatterPlot(datum: PokemonDatum | undefined) {
      self.hoveredDatumScatterPlot = datum
    },
    setHoveredMatrix(datum: MatrixDatum | undefined) {
      self.hoveredDatumMatrix = datum
    },
    setHoveredStack(datum: StackDatum | undefined) {
      self.hoveredDatumStack = datum
    },
    setSearchValue(inputValue: string) {
      console.log(self.searchValue)
      self.searchValue = inputValue
    },
    toggleSelectedPokemonId(n: number) {
      const newFilters = xor(self.selectedPokemonIds, [n])
      self.selectedPokemonIds = newFilters
    },
    setSelectedPokemonId(n: number) {
      self.selectedPokemonIds = [n]
    },
  }))
  .actions(
    lifeCycle((self) => {
      fetchPokemon().then((data) => {
        self.setData(data)
      })
    })
  )

export interface RootInstance extends Instance<typeof RootModel> {}

export const rootState = RootModel.create({})

export const RootStateContext = createContext<RootInstance | null>(null)

export function useMst() {
  const state = useContext(RootStateContext)
  if (isNil(state)) throw new Error("NON HAI USATO IL CONTEXT")

  return state
}
