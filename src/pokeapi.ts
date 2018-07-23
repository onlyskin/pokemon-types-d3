import * as stream from 'mithril/stream';
import { Pokedex } from 'pokeapi-js-wrapper';

export const pokemonList = stream<string[]>([]);

export const pokedex = new Pokedex({
    protocol: 'https',
    cache: true,
    timeout: 10 * 1000,
});

export function initPokemonList(): void {
    pokedex.getPokemonsList().then((response: any) => {
        const pokemon = response.results.map((r: any) => r.name);
        pokemonList(pokemon);
    });
}

