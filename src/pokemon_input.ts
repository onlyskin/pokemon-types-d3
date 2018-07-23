import * as m from 'mithril';
import { updateFocusedPokemon } from './actions';
import { pokemonList } from './pokeapi';

export const PokemonInput: m.Component<{
    pokemon: string[],
}, {
    inputText: string,
}> = {
    oninit: ({state}) => {
        state.inputText = 'bulbasaur';
    },
    view: ({attrs: {pokemon}, state}) => {
        return [
            m('input#pokemon-input[type=text]', {
                list: 'pokemon-dropdown',
                placeholder: 'bulbasaur',
                autocomplete: 'off',
                oninput: m.withAttr('value', value => {
                    state.inputText = value;

                    if (pokemonList().indexOf(value) !== -1) {
                        updateFocusedPokemon(value);
                    }
                }),
                value: state.inputText,
            }),
            m(
                'datalist#pokemon-dropdown',
                dropdownOptions(state.inputText, pokemon),
            ),
        ];
    },
}

function dropdownOptions(inputText: string, pokemon: string[]): m.Vnode<{}, {}>[] {
    if (inputText === '') {
        return [];
    }

    return matching(pokemon, inputText, 20)
        .map(pokemon => {
            return m('option', {value: pokemon})
        });
}

export function matching(
    pokemon: string[],
    matcher: string,
    limit: number,
): string[] {
    const regex = new RegExp(Array.from(matcher).join('.*'));
    return pokemon.reduce((acc, curr) => {
        if (acc.length >= limit) {
            return acc;
        }

        if (regex.test(curr)) {
            return acc.concat(curr);
        }

        return acc;
    }, []);
};
