import { isNil } from "lodash"

import { Instance, t } from "mobx-state-tree"
import { fetchPokemon, PokemonDatum } from "../api"
import { IReactionDisposer } from "mobx"
import { createContext, useContext } from "react"

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
    hoveredDatum: t.optional(t.frozen<PokemonDatum | undefined>(), undefined),
    selectedDatum: t.optional(t.frozen<PokemonDatum | undefined>(), undefined),
  })
  .views((self) => ({
    get columns() {
      return Object.keys(self.data?.[0] ?? {}) as (keyof PokemonDatum)[]
    },
  }))
  .actions((self) => ({
    setData(newData: PokemonDatum[]) {
      self.data = newData
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
