import { NextResponse } from "next/server"
import Papa from "papaparse";
import { ArtistCSVRow, Question } from "../constants/interfaces";
import { stringify } from "querystring";
import { numQuestions } from "../constants/constants";

async function getSpotifyAccessToken() {
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID ?? "";
    const clientsecret = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET ?? "";

    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: 'POST',
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            grant_type: "client_credentials",
            client_id: clientId,
            client_secret: clientsecret
        }),
    });

    if(!response.ok) {
        throw new Error(`Spotify Access token retrieval error: ${response.status}`);
    }

    const data = await response.json();
    console.log("inside useArtistData, the data gotten is ", data);
    const token: string = data.access_token;
    return token;
}

async function getArtistId(name: string, token: string): Promise<string> {
    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(name)}&type=artist&limit=1`, {
        headers: { "Authorization": `Bearer ${token}`}
    });

    const data = await response.json();
    const artist = data?.artists?.items?.[0];

    if(!artist) { throw new Error(`Artist not found: ${name}`); }

    return artist.id;
}

async function getArtistInfo(artistId: string, token: string): Promise<Question> {
    const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
        headers: { "Authorization": `Bearer ${token}` }
    });

    if(!response.ok) {
        throw new Error(`Artist info retrieval error: ${response.status}`);
    }

    const data = await response.json();

    const ret: Question = {
        id: data.id,
        artist_name: data.name ?? "",
        artist_genres: data.genres ?? [],
        artist_image: data.images[0].url ?? ""
    }

    return ret;
}

export default async function useSpotifyMap(names: string[]): Promise<Question[]> {
    const token = await getSpotifyAccessToken();

    try {
        const questions: Question[] = await Promise.all(
            names.map( async (name) => {
                const artistId: string = await getArtistId(name, token);
                const artistInfo: Question = await getArtistInfo(artistId, token);
                return artistInfo;
            })
        );
        console.log("retrieved questions are", questions);
        return questions;
    } catch(error) {
        throw new Error(`Error in getting all artists' spotify info: ${error}`);
    }
}