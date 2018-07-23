import * as m from 'mithril';
import { pokemonList } from './pokeapi';
import { updateFocusedPokemon } from './actions';

export const RandomPokemonButton: m.Component<{}, {}> = {
    view: () => {
        return m('button', {
            onclick: () => {
                const allPokemon = pokemonList();
                const randomIndex = Math.floor(allPokemon.length * Math.random());
                const randomPokemon = allPokemon[randomIndex];
                updateFocusedPokemon(randomPokemon);
            },
        }, 'Random');
    },
};
