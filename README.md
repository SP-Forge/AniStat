# AniStat

## Brugerguide

Tic Tac Chu er Kryds og Bolle med et Pokémon twist. I denne version skal man, efter man har valgt et felt,
gætte navent på den Pokémon der er på billedet. Hvis man gætter rigtigt, får man feltet, hvis ikke, så får man ingen ting.
Det forsættes indtil der er fundet en vinder.

## Opsætning

For backend:
Install Deno (PowerShell):
`irm https://deno.land/install.ps1 | iex`

For frontend:
Install NextJS:
`npm i next@latest react@latest react-dom@latest`

## Running Locally

- Open two terminal windows.
- Run backend in one (from `/anistat/backend`): `deno run --env-file --allow-env --allow-net main.ts`
- Access backend API at `http://localhost:3333/api/`
- Run frontend in the other (from `/anistat`): `npm run dev`
- Access website at `http://localhost:3000`
