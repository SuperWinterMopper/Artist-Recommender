import { error } from "console";
import { Rating } from "../constants/interfaces";

export default async function storeResults(gender: string, age: number, userResponses: Rating[]): Promise<string> {

    const response = await fetch('/flask/postUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ 'gender': gender, 'age': age, 'userResponses': userResponses })
    });

    if(!response.ok) {
        throw new Error(`storing user data failed: ${await response.text()}`);
    }

    const data = await response.json();
    console.log("data gotten from useStoreResults is ", data);
    return data.id;
}