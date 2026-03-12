const Base_URL = "/api/";

export async function getAnimeById(id: number) {
    const response = await fetch(`${Base_URL}getAnimeById/${id}`);

    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }

    return response.json();
}
