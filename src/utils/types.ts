import { PokemonDatum } from "../api"

export type ChartProps = {
  width: number
}

export interface MatrixDatum {
  type1: string
  type2: string
  count: number
  list: PokemonDatum[]
}

// interface mousePosition {
//   x: number
//   y: number
// }
