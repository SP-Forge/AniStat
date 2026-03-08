Make sure .env is added

install deno
`irm https://deno.land/install.ps1 | iex`

## Running Both Simultaneously

- Open two terminal windows
- Run backend in one: `deno run --env-file main.ts` (from `/backend`)
- Access backend api at `http://localhost:3333`
- Run frontend in the other: `npm run dev` (from `/frontend`)
- Access application at `http://localhost:3000`
