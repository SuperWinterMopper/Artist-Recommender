import Papa from "papaparse";
import { numQuestions } from "../constants/constants";
import { ArtistCSVRow } from "../constants/interfaces";

export default async function useQuestionArtistNames(): Promise<string[]> {
    const res = await fetch(`/all_artists_considered.csv`)
    const csv = await res.text()

    const parsed = Papa.parse<ArtistCSVRow>(csv, {header: true, skipEmptyLines: true});
    const allNames = (parsed.data as { artist_name?: string }[]).map(r => r.artist_name ?? "").filter(Boolean);

    const topNames = allNames.slice(0, numQuestions);
    return topNames;
}