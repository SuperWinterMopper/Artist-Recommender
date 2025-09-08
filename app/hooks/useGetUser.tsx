import { Rating } from "../constants/interfaces";

export default async function useGetUser(id: string): Promise<{ gender: string, age: number, userResponses: Rating[] }> {
    const response = await fetch(`/flask/getUser?id=${encodeURIComponent(id)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });

    if(!response.ok) {
        throw new Error(`Error fetching user data: ${await response.text()}`);
    }

    const data = await response.json();
    console.log("data gotten from useGetUser is ", data);
    const gender: string = data.gender;
    const age: number = data.age;
    const artists: string[] = data.artists;
    const ratings: number[] = data.ratings;

    if (typeof gender !== "string") {
        throw new Error(`Expected gender to be a string, but got ${typeof gender}`);
    }
    if (typeof age !== "number") {
        throw new Error(`Expected age to be a number, but got ${typeof age}`);
    }
    if (!Array.isArray(artists)) {
        throw new Error(`Expected artists to be an array, but got ${typeof artists}`);
    }


    // console log the above variables
    // console.log("Gender: ", gender);
    // console.log("Age: ", age);
    // console.log("Artists: ", artists);
    // console.log("Ratings: ", ratings);

    if(artists.length != ratings.length) {
        throw new Error(`Artists and ratings have different lengths.\nArtists: ${artists}\nRatings: ${ratings}`);
    }

    const userResponses: Rating[] = artists.map((artist, i) => ({value: ratings[i], label: artist}));
    return {gender: gender, age: age, userResponses: userResponses};
}