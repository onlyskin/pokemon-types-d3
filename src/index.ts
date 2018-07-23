import * as m from 'mithril';
import { Visualisation } from './visualisation';
import { focusedPokemon, hoveredNode, visualisationTitle } from './actions';
import { forceSimulation } from './simulation';
import { PokemonInput } from './pokemon_input';
import { pokemonList, initPokemonList } from './pokeapi';
import { RandomPokemonButton } from './random_pokemon';

window.addEventListener('resize', () => {
    m.redraw();
});

initPokemonList();

m.mount(document.body, {
    view: () => {
        return [
            m(PokemonInput, {pokemon: pokemonList()}),
            m(RandomPokemonButton),
            m(Visualisation, {
                focused: focusedPokemon(),
                title: visualisationTitle(
                    hoveredNode(),
                    focusedPokemon(),
                ),
                forceSimulation,
            }),
        ];
    },
});
