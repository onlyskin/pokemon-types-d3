import { ITypeResponse } from './type_to_nodes'
import { Pokedex } from 'pokeapi-js-wrapper';
import typeToNodes from './type_to_nodes';
import { INode } from './type_to_nodes';

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
    timeout: 10 * 1000,
});

export async function pokemonToTypes(response: IPokemonResponse): Promise<ITypeResponse[]> {
    const responses = await response.types.map(async (typeField) => {
        return await pokedex.getTypeByName(typeField.type.name) as ITypeResponse;
    });

    return Promise.all(responses);
}

export default (typeResponses: ITypeResponse[]): INode[] => {
    const fromNodes = typeResponses.map((typeResponse) => {
        return typeToNodes(typeResponse).filter((node) => node.direction === 'from')
    }).reduce((acc, curr) => acc.concat(curr), []);

    const sorted = [...fromNodes].sort((a, b) => a.name.localeCompare(b.name));

    const multiplied = sorted.reduce((acc, curr) => {
        if (acc.length === 0) {
            return acc.concat(curr);
        }

        const lastIndex = acc.length - 1;
        if (acc[lastIndex].name === curr.name) {
            return acc.slice(0, lastIndex).concat({
                name: curr.name,
                multiplier: curr.multiplier * acc[lastIndex].multiplier,
                direction: curr.direction,
            });
        }

        return acc.concat(curr);
    }, [] as INode[]);

    return multiplied.filter((node) => node.multiplier !== 1);
}
