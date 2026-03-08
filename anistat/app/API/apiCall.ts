const Base_URL = "http://localhost:3333/api/";

export async function getAnimeById(id: number) {
    const response = await fetch(`${Base_URL}getAnimeById/${id}`);

    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }

    return response.json();
}
