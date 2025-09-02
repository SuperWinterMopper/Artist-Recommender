export interface Question {
  id: number
  artist_name: string
  artist_genres: string[]
  artist_image: string
}

export interface Rating {
  value: string
  label: string
  color: string
}