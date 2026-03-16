/// <reference lib="deno.ns" />
// deno-lint-ignore-file no-import-prefix no-explicit-any

import { Application, Router } from "@oak/oak";
import { oakCors } from "@tajpouria/cors";
import { neon } from "@neon/serverless";
import { hash, verify } from "jsr:@denorg/scrypt@4.4.4";

export const app = new Application();
const router = new Router();

///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////

// AniStat API

/*
const databaseUrl = Deno.env.get("CONNECTION_STRING")!;
const sql = neon(databaseUrl);

try {
    // Create the table
    await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    )
  `;
} catch (error) {
    console.error(error);
}

*/

router.get("/api/", (res) => {
    res.response.body = "Hello world!";
});

/*
router.post("/api/login", async (ctx) => {
    try {
        const value = await ctx.request.body.json();

        if (!value.username || !value.password) {
            ctx.response.status = 401;
            ctx.response.body = { error: "Username and password are required" };
            return;
        }

        const user = await sql`
            SELECT * FROM users WHERE username = ${value.username}
        `;

        const isMatch = await verify(value.password, user[0].password);
        if (!isMatch || !user.length) {
            ctx.response.status = 401;
            ctx.response.body = { error: "Invalid username or password" };
            return;
        }

        console.log("Login request body:", value);
        ctx.response.status = 200;
        ctx.response.body = { message: "Login received", data: value };
    } catch (err: any) {
        ctx.response.status = 400;
        ctx.response.body = { error: "Invalid request body", details: err?.message ?? err };
    }
});

router.post("/api/register", async (ctx) => {
    try {
        const value = await ctx.request.body.json();

        if (!value.username || !value.password) {
            ctx.response.status = 401;
            ctx.response.body = { error: "Username and password are required" };
            return;
        }

        const user = await sql`
            SELECT * FROM users WHERE username = ${value.username}
        `;

        if (user.length) {
            ctx.response.status = 409;
            ctx.response.body = { error: "Username already exists" };
            return;
        }

        const hashedPassword = await hash(value.password);
        value.password = hashedPassword;

        const newUser = await sql`
            INSERT INTO users (username, password) VALUES (${value.username}, ${value.password}) RETURNING *
        `;

        console.log("New user created:", newUser);

        ctx.response.status = 200;
        ctx.response.body = { message: "User registered successfully" };
    } catch (err: any) {
        ctx.response.status = 400;
        ctx.response.body = { error: "Invalid request body", details: err?.message ?? err };
    }
});

*/

///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////

// Anime API

const baseURL = "https://api.myanimelist.net/v2/";
const CLIENT_ID = Deno.env.get("CLIENT_ID");

if (!CLIENT_ID) {
    console.log("CLIENT_ID environment variable is not set");
}

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

router.get("/api/GetMovieAnimes", async (ctx) => {
    if (!CLIENT_ID) {
        ctx.response.status = 500;
        ctx.response.body = { error: "Client ID is not configured" };
        return;
    }

    try {
        const response = await fetch(`${baseURL}anime/ranking?limit=500&ranking_type=movie&offset=0&fields=main_picture,alternative_titles,mean`, {
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

router.get("/api/GetTVAnimes", async (ctx) => {
    if (!CLIENT_ID) {
        ctx.response.status = 500;
        ctx.response.body = { error: "Client ID is not configured" };
        return;
    }

    try {
        const response = await fetch(`${baseURL}anime/ranking?limit=500&ranking_type=tv&offset=0&fields=main_picture,alternative_titles,mean`, {
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

///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////

// Pokemon API

const PokebaseURL = "https://api.poketrace.com/v1/";
const Pokemon_API_KEY = Deno.env.get("Pokemon_API_KEY");
const journeyTogetherCacheFile = new URL("../public/pokemonJourneyTogether.json", import.meta.url);
const Pokemon151CacheFile = new URL("../public/pokemon151.json", import.meta.url);
const PrismaticEvolutionsCacheFile = new URL("../public/pokemonPrismaticEvolutions.json", import.meta.url);
async function readPrismaticEvolutionsCache() {
    try {
        const raw = await Deno.readTextFile(PrismaticEvolutionsCacheFile);
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

async function writePrismaticEvolutionsCache(data: unknown) {
    await Deno.mkdir(new URL("../public", import.meta.url), { recursive: true });
    await Deno.writeTextFile(PrismaticEvolutionsCacheFile, JSON.stringify(data, null, 2));
}
router.get("/api/getPokemonPrismaticEvolutions", async (ctx) => {
    const forceRefresh = ctx.request.url.searchParams.get("refresh") === "true";
    const cachedData = await readPrismaticEvolutionsCache();
    const normalizedCachedData = cachedData ? normalizeJourneyTogetherData(cachedData) : null;

    if (!forceRefresh) {
        if (normalizedCachedData) {
            ctx.response.status = 200;
            ctx.response.body = normalizedCachedData;
            return;
        }
    }

    if (!Pokemon_API_KEY) {
        ctx.response.status = 500;
        ctx.response.body = { error: "Pokemon API Key is not configured and cache file was not found" };
        return;
    }

    try {
        const collected = [];
        const seen = new Set();
        const pageSignatures = new Set();
        let page = 0;
        let cursor = null;
        let hasMore = true;
        let consecutive429s = 0;
        let pagesFetched = 0;
        let lastPageAddedCards = 0;

        while (page < MAX_SET_PAGES && hasMore) {
            const offset = page * POKEMON_PAGE_SIZE;
            const cursorPart = cursor ? `&cursor=${encodeURIComponent(cursor)}` : "";
            const query = `cards?set=sv-prismatic-evolutions&limit=${POKEMON_PAGE_SIZE}&offset=${offset}${cursorPart}`;
            const response = await fetchCardsPage(query);

            if (response.status === 429) {
                consecutive429s += 1;
                const retryAfterHeader = response.headers.get("retry-after");
                const retryAfterSeconds = retryAfterHeader ? Number(retryAfterHeader) : NaN;
                const waitMs = Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0 ? retryAfterSeconds * 1000 : 1500;
                if (consecutive429s <= 5) {
                    await sleep(waitMs);
                    continue;
                }
                if (normalizedCachedData) {
                    ctx.response.status = 200;
                    ctx.response.body = {
                        ...normalizedCachedData,
                        meta: {
                            stale: true,
                            note: "Rate limited by upstream API. Returned cached data.",
                        },
                    };
                    return;
                }
                ctx.response.status = 429;
                ctx.response.body = {
                    error: "Rate limited by upstream API and no cache is available",
                };
                return;
            }
            consecutive429s = 0;
            if (!response.ok) {
                ctx.response.status = response.status;
                ctx.response.body = {
                    error: "Failed to fetch pokemon data from PokeAPI",
                };
                return;
            }
            const payload = await response.json();
            const pageData = Array.isArray(payload?.data) ? payload.data : [];
            const pagination = payload?.pagination;
            let addedThisPage = 0;
            pagesFetched += 1;
            if (pageData.length === 0) {
                break;
            }
            const pageSignature = pageData.map((item: { id: any }) => item?.id ?? "").join("|");
            if (pageSignatures.has(pageSignature)) {
                break;
            }
            pageSignatures.add(pageSignature);
            for (const item of pageData) {
                if (!isPokemonCard(item)) {
                    continue;
                }
                if (item.id && seen.has(item.id)) {
                    continue;
                }
                if (item.id) {
                    seen.add(item.id);
                }
                collected.push(item);
                addedThisPage += 1;
            }
            lastPageAddedCards = addedThisPage;
            hasMore = Boolean(pagination?.hasMore);
            cursor = typeof pagination?.nextCursor === "string" && pagination.nextCursor.length > 0 ? pagination.nextCursor : null;
            page += 1;
            await sleep(500);
        }
        const data = { data: collected };
        if (data.data.length > 0) {
            await writePrismaticEvolutionsCache(data);
        }
        ctx.response.status = 200;
        ctx.response.body = {
            ...data,
            meta: {
                count: data.data.length,
                mode: "all-from-set",
                pagesFetched,
                lastPageAddedCards,
            },
        };
    } catch (error) {
        console.error("Error fetching pokemon data:", error);
        ctx.response.status = 500;
        ctx.response.body = { error: "Failed to fetch pokemon data" };
    }
});
const POKEMON_PAGE_SIZE = 20;
const MAX_SET_PAGES = 500;

const NON_CARD_TERMS = ["blister", "box", "bundle", "pack", "tin", "case", "deck", "collection", "trainer kit", "build & battle", "sleeved", "checklane", "booster"];

function isPokemonCard(item: { name?: string; cardNumber?: string | null }) {
    const hasCardNumber = typeof item.cardNumber === "string" && item.cardNumber.trim().length > 0;
    if (!hasCardNumber) {
        return false;
    }

    // Allow item cards to show: include cards whose name contains 'item'
    const lowerName = (item.name ?? "").toLowerCase();
    if (lowerName.includes("item")) {
        return true;
    }

    return !NON_CARD_TERMS.some((term) => lowerName.includes(term));
}

function normalizeJourneyTogetherData(payload: { data?: Array<{ id?: string; name?: string; cardNumber?: string | null }> }) {
    const source = Array.isArray(payload?.data) ? payload.data : [];
    const seen = new Set<string>();
    const filtered: Array<{ id?: string; name?: string; cardNumber?: string | null }> = [];

    for (const item of source) {
        if (!isPokemonCard(item)) {
            continue;
        }

        if (item.id && seen.has(item.id)) {
            continue;
        }

        if (item.id) {
            seen.add(item.id);
        }

        filtered.push(item);
    }

    return { ...payload, data: filtered };
}

if (!Pokemon_API_KEY) {
    console.log("Pokemon_API_KEY environment variable is not set");
}

async function readJourneyTogetherCache() {
    try {
        const raw = await Deno.readTextFile(journeyTogetherCacheFile);
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

async function writeJourneyTogetherCache(data: unknown) {
    await Deno.mkdir(new URL("../public", import.meta.url), { recursive: true });
    await Deno.writeTextFile(journeyTogetherCacheFile, JSON.stringify(data, null, 2));
}

async function fetchCardsPage(query: string) {
    const response = await fetch(`${PokebaseURL}${query}`, {
        headers: {
            "X-API-Key": Pokemon_API_KEY!,
        },
    });

    return response;
}

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

router.get("/api/getPokemonJourneyTogether", async (ctx) => {
    const forceRefresh = ctx.request.url.searchParams.get("refresh") === "true";
    const cachedData = await readJourneyTogetherCache();
    const normalizedCachedData = cachedData ? normalizeJourneyTogetherData(cachedData) : null;

    if (!forceRefresh) {
        if (normalizedCachedData) {
            ctx.response.status = 200;
            ctx.response.body = normalizedCachedData;
            return;
        }
    }

    if (!Pokemon_API_KEY) {
        ctx.response.status = 500;
        ctx.response.body = { error: "Pokemon API Key is not configured and cache file was not found" };
        return;
    }

    try {
        const collected: Array<{ id?: string; name?: string; cardNumber?: string | null }> = [];
        const seen = new Set<string>();
        const pageSignatures = new Set<string>();
        let page = 0;
        let cursor: string | null = null;
        let hasMore = true;
        let consecutive429s = 0;
        let pagesFetched = 0;
        let lastPageAddedCards = 0;

        while (page < MAX_SET_PAGES && hasMore) {
            const offset = page * POKEMON_PAGE_SIZE;
            const cursorPart = cursor ? `&cursor=${encodeURIComponent(cursor)}` : "";
            const query = `cards?set=sv09-journey-together&limit=${POKEMON_PAGE_SIZE}&offset=${offset}${cursorPart}`;
            const response = await fetchCardsPage(query);

            if (response.status === 429) {
                consecutive429s += 1;

                const retryAfterHeader = response.headers.get("retry-after");
                const retryAfterSeconds = retryAfterHeader ? Number(retryAfterHeader) : NaN;
                const waitMs = Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0 ? retryAfterSeconds * 1000 : 1500;

                if (consecutive429s <= 5) {
                    await sleep(waitMs);
                    continue;
                }

                if (normalizedCachedData) {
                    ctx.response.status = 200;
                    ctx.response.body = {
                        ...normalizedCachedData,
                        meta: {
                            stale: true,
                            note: "Rate limited by upstream API. Returned cached data.",
                        },
                    };
                    return;
                }

                ctx.response.status = 429;
                ctx.response.body = {
                    error: "Rate limited by upstream API and no cache is available",
                };
                return;
            }

            consecutive429s = 0;

            if (!response.ok) {
                ctx.response.status = response.status;
                ctx.response.body = {
                    error: "Failed to fetch pokemon data from PokeAPI",
                };
                return;
            }

            const payload = await response.json();
            const pageData = Array.isArray(payload?.data) ? payload.data : [];
            const pagination = payload?.pagination;
            let addedThisPage = 0;
            pagesFetched += 1;

            if (pageData.length === 0) {
                break;
            }

            // Detect repeated raw pages in case upstream ignores offset.
            const pageSignature = pageData.map((item: { id: any }) => item?.id ?? "").join("|");
            if (pageSignatures.has(pageSignature)) {
                break;
            }
            pageSignatures.add(pageSignature);

            for (const item of pageData) {
                if (!isPokemonCard(item)) {
                    continue;
                }

                if (item.id && seen.has(item.id)) {
                    continue;
                }

                if (item.id) {
                    seen.add(item.id);
                }

                collected.push(item);
                addedThisPage += 1;
            }

            lastPageAddedCards = addedThisPage;

            hasMore = Boolean(pagination?.hasMore);
            cursor = typeof pagination?.nextCursor === "string" && pagination.nextCursor.length > 0 ? pagination.nextCursor : null;

            page += 1;

            // Small pause between paged calls to reduce burst-rate limit hits.
            await sleep(500);
        }

        const data = { data: collected };
        if (data.data.length > 0) {
            await writeJourneyTogetherCache(data);
        }
        ctx.response.status = 200;
        ctx.response.body = {
            ...data,
            meta: {
                count: data.data.length,
                mode: "all-from-set",
                pagesFetched,
                lastPageAddedCards,
            },
        };
    } catch (error) {
        console.error("Error fetching pokemon data:", error);
        ctx.response.status = 500;
        ctx.response.body = { error: "Failed to fetch pokemon data" };
    }
});

async function readPokemon151Cache() {
    try {
        const raw = await Deno.readTextFile(Pokemon151CacheFile);
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

async function writePokemon151Cache(data: unknown) {
    await Deno.mkdir(new URL("../public", import.meta.url), { recursive: true });
    await Deno.writeTextFile(Pokemon151CacheFile, JSON.stringify(data, null, 2));
}

router.get("/api/getPokemon151", async (ctx) => {
    const forceRefresh = ctx.request.url.searchParams.get("refresh") === "true";
    const cachedData = await readPokemon151Cache();
    const normalizedCachedData = cachedData ? normalizeJourneyTogetherData(cachedData) : null;

    if (!forceRefresh) {
        if (normalizedCachedData) {
            ctx.response.status = 200;
            ctx.response.body = normalizedCachedData;
            return;
        }
    }

    if (!Pokemon_API_KEY) {
        ctx.response.status = 500;
        ctx.response.body = { error: "Pokemon API Key is not configured and cache file was not found" };
        return;
    }

    try {
        const collected = [];
        const seen = new Set();
        const pageSignatures = new Set();
        let page = 0;
        let cursor = null;
        let hasMore = true;
        let consecutive429s = 0;
        let pagesFetched = 0;
        let lastPageAddedCards = 0;

        while (page < MAX_SET_PAGES && hasMore) {
            const offset = page * POKEMON_PAGE_SIZE;
            const cursorPart = cursor ? `&cursor=${encodeURIComponent(cursor)}` : "";
            const query = `cards?set=sv-scarlet-and-violet-151&limit=${POKEMON_PAGE_SIZE}&offset=${offset}${cursorPart}`;
            const response = await fetchCardsPage(query);

            if (response.status === 429) {
                consecutive429s += 1;
                const retryAfterHeader = response.headers.get("retry-after");
                const retryAfterSeconds = retryAfterHeader ? Number(retryAfterHeader) : NaN;
                const waitMs = Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0 ? retryAfterSeconds * 1000 : 1500;
                if (consecutive429s <= 5) {
                    await sleep(waitMs);
                    continue;
                }
                if (normalizedCachedData) {
                    ctx.response.status = 200;
                    ctx.response.body = {
                        ...normalizedCachedData,
                        meta: {
                            stale: true,
                            note: "Rate limited by upstream API. Returned cached data.",
                        },
                    };
                    return;
                }
                ctx.response.status = 429;
                ctx.response.body = {
                    error: "Rate limited by upstream API and no cache is available",
                };
                return;
            }
            consecutive429s = 0;
            if (!response.ok) {
                ctx.response.status = response.status;
                ctx.response.body = {
                    error: "Failed to fetch pokemon data from PokeAPI",
                };
                return;
            }
            const payload = await response.json();
            const pageData = Array.isArray(payload?.data) ? payload.data : [];
            const pagination = payload?.pagination;
            let addedThisPage = 0;
            pagesFetched += 1;
            if (pageData.length === 0) {
                break;
            }
            const pageSignature = pageData.map((item: { id: any }) => item?.id ?? "").join("|");
            if (pageSignatures.has(pageSignature)) {
                break;
            }
            pageSignatures.add(pageSignature);
            for (const item of pageData) {
                if (!isPokemonCard(item)) {
                    continue;
                }
                if (item.id && seen.has(item.id)) {
                    continue;
                }
                if (item.id) {
                    seen.add(item.id);
                }
                collected.push(item);
                addedThisPage += 1;
            }
            lastPageAddedCards = addedThisPage;
            hasMore = Boolean(pagination?.hasMore);
            cursor = typeof pagination?.nextCursor === "string" && pagination.nextCursor.length > 0 ? pagination.nextCursor : null;
            page += 1;
            await sleep(500);
        }
        const data = { data: collected };
        if (data.data.length > 0) {
            await writePokemon151Cache(data);
        }
        ctx.response.status = 200;
        ctx.response.body = {
            ...data,
            meta: {
                count: data.data.length,
                mode: "all-from-set",
                pagesFetched,
                lastPageAddedCards,
            },
        };
    } catch (error) {
        console.error("Error fetching pokemon data:", error);
        ctx.response.status = 500;
        ctx.response.body = { error: "Failed to fetch pokemon data" };
    }
});

app.use(oakCors());
app.use(router.routes());
app.use(router.allowedMethods());

if (import.meta.main) {
    const port = Number(Deno.env.get("BACKEND_PORT") ?? "3333");
    const hostname = "0.0.0.0";

    console.log(`Server listening on http://${hostname}:${port}`);
    await app.listen({ hostname, port });
}
