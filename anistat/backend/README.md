Make sure `.env` is present in this folder and contains `CLIENT_ID`.

Install Deno (PowerShell):
`irm https://deno.land/install.ps1 | iex`

## Running Locally

- Open two terminal windows.
- Run backend in one (from `/anistat/backend`): `deno run --allow-net --allow-env --allow-read --allow-write main.ts`
- Access backend API at `http://localhost:3333/api/`
- Run frontend in the other (from `/anistat`): `npm run dev`
- Access app at `http://localhost:3000`
