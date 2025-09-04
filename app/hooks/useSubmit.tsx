import { error } from "console";
import { Rating } from "../constants/interfaces";

export default async function useSubmit(gender: string, age: number, userResponses: Rating[]) {
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
        const text = await response.text();
        throw new Error(`submitting ratings failed: ${text}`);
    }

    const data = await response.json();

    console.log("recs: ", data);
}