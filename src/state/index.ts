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
    scatterFilters: t.optional(t.frozen<number[]>(), []),
    // selectedDatum: t.optional(t.frozen<PokemonDatum | undefined>(), undefined),
  })
  .views((self) => ({
    get columns() {
      return Object.keys(self.data?.[0] ?? {}) as (keyof PokemonDatum)[]
    },
    get filteredScatterData() {
      if (self.scatterFilters.length > 0)
        return self.data.map((d) => (includes(self.scatterFilters, d.Generation) ? d : {}))
      return self.data
    },
  }))
  .actions((self) => ({
    setData(newData: PokemonDatum[]) {
      self.data = newData
    },
    toggleFilters(filter: number) {
      const newFilters = xor(self.scatterFilters, [filter])

      self.scatterFilters = newFilters
      console.log(self.scatterFilters)
    },
    // getDomain(key: keyof PokemonDatum[]) {
    //   // extent(self.data.map((datum) => datum[key])) as [number, number]
    // },
    setHoveredScatterPlot(datum: PokemonDatum | undefined) {
      console.log(datum)
      self.hoveredDatumScatterPlot = datum
    },
    setHoveredMatrix(datum: MatrixDatum | undefined) {
      console.log(datum)
      self.hoveredDatumMatrix = datum
    },
    setHoveredStack(datum: StackDatum | undefined) {
      console.log(datum)
      self.hoveredDatumStack = datum
    },
  }))
  .actions(
    lifeCycle((self) => {
      fetchPokemon().then((data) => {
        // console.log(data);
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
