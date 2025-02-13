import { RadarVariable } from "./utils/types"

export const TYPES = [
  { name: "grass", color: "#8CC260" },
  { name: "fire", color: "#E38643" },
  { name: "water", color: "#748CC8" },
  { name: "bug", color: "#ABB542" },
  { name: "normal", color: "#A8A67D" },
  { name: "poison", color: "#924A96" },
  { name: "electric", color: "#F3D154" },
  { name: "ground", color: "#DBBF75" },
  { name: "fairy", color: "#D996C2" },
  { name: "fighting", color: "#B13D30" },
  { name: "psychic", color: "#E66289" },
  { name: "rock", color: "#B2A04A" },
  { name: "ghost", color: "#6D5B95" },
  { name: "ice", color: "#A5D7D8" },
  { name: "dragon", color: "#524E9B" },
  { name: "steel", color: "#B8B7CB" },
  { name: "dark", color: "#6C594B" },
  { name: "flying", color: "#A192C9" },
]

export const REGIONS = [
  {
    gen: 1,
    region: "Kanto",
  },
  {
    gen: 2,
    region: "Johto",
  },
  {
    gen: 3,
    region: "Hoenn",
  },
  {
    gen: 4,
    region: "Sinnoh",
  },
  {
    gen: 5,
    region: "Unova",
  },
  {
    gen: 6,
    region: "Kalos",
  },
]

export const RADAR_VARIABLES: RadarVariable[] = [
  "HP",
  "Attack",
  "Defense",
  "Sp. Atk",
  "Sp. Def",
  "Speed",
]
