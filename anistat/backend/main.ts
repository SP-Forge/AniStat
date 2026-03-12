/// <reference lib="deno.ns" />

import { Application, Router } from "@oak/oak";
import { oakCors } from "@tajpouria/cors";

export const app = new Application();
const router = new Router();

const baseURL = "https://api.myanimelist.net/v2/";
const CLIENT_ID = Deno.env.get("CLIENT_ID");

if (!CLIENT_ID) {
    console.log("CLIENT_ID environment variable is not set");
}

router.get("/api/", (res) => {
    res.response.body = "Hello world!";
});

router.get("/api/getAnimeById/:id", async (ctx) => {
    const id = ctx.params.id;

    if (!id) {
        ctx.response.status = 400;
        ctx.response.body = { error: "Anime ID is required" };
        return;
    }

    if (!CLIENT_ID) {
        ctx.response.status = 500;
        ctx.response.body = { error: "Client ID is not configured" };
        return;
    }

    try {
        const response = await fetch(`${baseURL}anime/${id}`, {
            headers: {
                "X-MAL-CLIENT-ID": CLIENT_ID,
            },
        });

        if (!response.ok) {
            ctx.response.status = response.status;
            ctx.response.body = {
                error: "Failed to fetch anime data from MyAnimeList",
            };
            return;
        }

        const data = await response.json();
        ctx.response.status = 200;
        ctx.response.body = data;
    } catch (error) {
        console.error("Error fetching anime data:", error);
        ctx.response.status = 500;
        ctx.response.body = { error: "Failed to fetch anime data" };
    }
});

router.get("/api/getAnimesByPopularity", async (ctx) => {
    if (!CLIENT_ID) {
        ctx.response.status = 500;
        ctx.response.body = { error: "Client ID is not configured" };
        return;
    }

    try {
        const response = await fetch(`${baseURL}anime/ranking?limit=500&ranking_type=bypopularity&offset=0&fields=main_picture,alternative_titles,mean`, {
            headers: {
                "X-MAL-CLIENT-ID": CLIENT_ID,
            },
        });

        if (!response.ok) {
            ctx.response.status = response.status;
            ctx.response.body = {
                error: "Failed to fetch anime data from MyAnimeList",
            };
            return;
        }

        const data = await response.json();
        ctx.response.status = 200;
        ctx.response.body = data;
    } catch (error) {
        console.error("Error fetching anime data:", error);
        ctx.response.status = 500;
        ctx.response.body = { error: "Failed to fetch anime data" };
    }
});

app.use(oakCors());
app.use(router.routes());
app.use(router.allowedMethods());

if (import.meta.main) {
    const port = Number(Deno.env.get("PORT") ?? "3333");
    const hostname = "0.0.0.0";

    console.log(`Server listening on http://${hostname}:${port}`);
    await app.listen({ hostname, port });
}
