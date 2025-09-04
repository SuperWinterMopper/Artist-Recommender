import { error } from "console";
import { Rating, ReccomendedArtist } from "../constants/interfaces";

export default async function useSubmit(gender: string, age: number, userResponses: Rating[]): Promise<ReccomendedArtist[]> {
    const base = process.env.NEXT_PUBLIC_BASE_API ?? "";

    let input: Record<string, string | number> = { 'user_id': "qwertyuiop", 'gender': gender, 'age': age };

    for(const { label, value } of userResponses) {
        input[label.toLowerCase()] = value;
    }

    const response = await fetch(`/flask/ratings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
    });

    if(!response.ok) {
        throw new Error(`submitting ratings failed: ${await response.text()}`);
    }

    const data = await response.json();
    // Transform the format to an array of objects
    const artistsArray = Object.keys(data.artist_name).map(index => ({
      artist_name: data.artist_name[index],
      match_score: data.match_score[index]
    }));
    return artistsArray;
}