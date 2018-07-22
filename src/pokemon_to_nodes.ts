import { INode } from './type_to_nodes'
import { Pokedex } from 'pokeapi-js-wrapper';

export interface ITypeField {
    type: {
        name: string;
    };
}

export interface IPokemonResponse {
    name: string;
    types: ITypeField[];
}

// const response: IPokemonResponse = await pokedex.getPokemonByName('bulbasaur');

const pokedex = new Pokedex({
    protocol: 'https',
    cache: true,
    timeout: 5 * 1000,
});

async function pokemonToTypes(response: IPokemonResponse): Promise<INode[]> {
    const types = await response.types.map((typeField) => {
        return pokedex.getTypeByName(typeField.type.name).name;
    });
    return types;
}

console.log(pokemonToTypes);

// const fromNodes = flatten(types.map((type) => {
//     return typeToNodes(types).filter((node) => node.direction === 'from')
// }));
// const sorted = [...fromNodes].sortBy(name)
// return sorted.reduce((acc, curr) => {
//     if (acc.last.name === curr.name) {
//         return acc[:-1].concat(node(
//             curr.name,
//             curr.multiplier * acc.last.multiplier,
//             curr.direction,
//         ));
//     }
// 
//     return acc.concat(curr);
// });
