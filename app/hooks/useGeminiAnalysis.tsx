
import { Question } from "../constants/interfaces";
import { GoogleGenAI } from "@google/genai";

export default async function useGeminiAnalysis(data: (Question & { match_score: number; })[]): Promise<string | undefined> {
    
    const ai = new GoogleGenAI({});

    const apiKey = process.env.GEMINI_API_KEY;

    if(!apiKey) {
        throw new Error("Gemini API key doesn't exist");
    }

    const prompt: string = "After answering a questionnaire on their musical tastes, a user received these artist recommendations. Analyze the following artists and their match scores. Provide insights on why these artists might be a good match for the user. Be humorous in your analysis. Poke fun at the user, making stereotypical jokes about what kind of people like these artists.\n\n" +
        data.map(artist => `Artist: ${artist.artist_name}\nGenres: ${artist.artist_genres.join(", ")}\nMatch Score: ${artist.match_score}\n`).join("\n") +
        "\n.";

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", {
        method: 'POST',
        headers: {}
    })
    

    return ret;
}