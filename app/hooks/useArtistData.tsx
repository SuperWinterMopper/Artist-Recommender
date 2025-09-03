import { NextResponse } from "next/server"
import Papa from "papaparse";
import { ArtistCSVRow, Question } from "../constants/interfaces";

async function spotifyMap() {
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

    const token = await response.json();
    console.log("inside useArtistData, the token gotten is ", token);
}

export default async function useAllArtists(): Promise<Question[]> {
    const res = await fetch(`/all_artists_considered.csv`)
    const csv = await res.text()

    const parsed = Papa.parse<ArtistCSVRow>(csv, {header: true, skipEmptyLines: true}).data;

    console.log("the csv parsed data is ", parsed);
    spotifyMap();

    return [];
}