import * as stream from 'mithril/stream';
import * as m from 'mithril';
import { Pokedex } from 'pokeapi-js-wrapper';

export const pokemonList = stream<string[]>([]);

export function initPokemonList(): void {
    const pokedex = new Pokedex({
        protocol: 'https',
        cache: true,
        timeout: 5 * 1000,
    });

    pokedex.getPokemonsList().then((response: any) => {
        const pokemon = response.results.map((r: any) => r.name);
        pokemonList(pokemon);
    });
}

export const PokemonInput: m.Component<{
    pokemon: string[],
}, {
    inputText: string,
}> = {
    oninit: ({state}) => {
        state.inputText = '';
    },
    view: ({attrs: {pokemon}, state}) => {
        return [
            m('input#pokemon-input[type=text]', {
                list: 'pokemon-dropdown',
                placeholder: 'bulbasaur',
                autocomplete: 'off',
                oninput: m.withAttr('value', v => state.inputText = v),
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
