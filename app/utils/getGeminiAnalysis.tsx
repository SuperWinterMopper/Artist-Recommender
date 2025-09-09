import { Question } from "../constants/interfaces";

export default async function getGeminiAnalysis(data: (Question & { match_score: number; })[]): Promise<string | undefined> {
    
    // const ai = new GoogleGenAI({});

    // const apiKey = process.env.GEMINI_API_KEY;
    // if(!apiKey) {
    //     throw new Error("Gemini API key doesn't exist");
    // }

    // if(!apiKey) {
    //     throw new Error("Gemini API key doesn't exist");
    // }

    const prompt: string = "After answering a questionnaire on their musical tastes, a user received these artist recommendations. Analyze the following artists and their match scores. Provide insights on why these artists might be a good match for the user. Be humorous in your analysis. Poke fun at the user, making stereotypical jokes about what kind of people like these artists. But don't be TOO overdramatic or annoying. Keep your response concise, not more than a paragraph. Don't explicitly point out the match scores.\n\n" +
        data.map(artist => `Artist: ${artist.artist_name}\nGenres: ${artist.artist_genres.join(", ")}\nMatch Score: ${artist.match_score.toPrecision(2)}\n`).join("\n") +
        "\n.";

    const response = await fetch("/flask/gemini", {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({'prompt': prompt})
    });

    if(!response.ok) {
        throw new Error(`getting gemini impression failed: ${await response.text()}`);
    }

    const ret = await response.json();
    return ret;
}