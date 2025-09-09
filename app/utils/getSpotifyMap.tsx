import { Question } from "../constants/interfaces";

export default async function getSpotifyMap(names: string[]): Promise<Question[]> {
    const response = await fetch("/api/spotify", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ names: names })
    })

    if (!response.ok) {
        throw new Error(`Failed to fetch data from Spotify API, ${await response.text()}`); 
    }

    const data = await response.json()
    return data.questions
}