import pokemonData from "../../public/pokemon-details.json" with { type: "json" };

export type PokemonList = [string, string];

// Function to get a random Pokémon from the first 151 Pokémon
export function getRandomPokemon(): PokemonList {
  const { pokemon } = pokemonData;
  const randomIndex = Math.floor(Math.random() * pokemon.length);

  if (randomIndex < 151) {
    const pokemonName =
      pokemon[randomIndex].name.charAt(0).toUpperCase() +
      pokemon[randomIndex].name.slice(1);

    console.log(pokemon[randomIndex].name, pokemon[randomIndex].id);
    return [
      pokemonName,
      "https://img.pokemondb.net/artwork/" + pokemon[randomIndex].name + ".jpg",
    ];
  } else {
    return getRandomPokemon();
  }
}
