const Base_URL = "https://api.myanimelist.net/v2/";

export async function getAnimeById(id: number) {
  const response = await fetch(`${Base_URL}anime/${id}`, {
    headers: {
      "X-MAL-CLIENT-ID": "a0fae499a56feb99c859388e37e840c2",
    },
  });
  return response.json();
}