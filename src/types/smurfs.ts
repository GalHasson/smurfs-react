export interface SmurfLocation {
  x: number
  y: number
}

export interface Smurf {
  id: string
  firstName: string
  lastName: string
  location: SmurfLocation
  createdAt: string
  quotes: string[]
}

export interface ActiveCell {
  row: number
  col: number
}
