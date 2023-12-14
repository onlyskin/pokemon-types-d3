import { PokemonType, PokemonTypeDict, PokemonData } from './utils';

type Direction = 'from' | 'to';

export interface INode extends d3.SimulationNodeDatum {
    name: PokemonType;
    multiplier: number;
    direction: Direction;
}

interface IDamageRelation {
    name: PokemonType;
}

export interface ITypeResponse {
    name: PokemonType;
    damage_relations: {
        half_damage_to: IDamageRelation[];
        double_damage_to: IDamageRelation[];
        no_damage_to: IDamageRelation[];
        half_damage_from: IDamageRelation[];
        double_damage_from: IDamageRelation[];
        no_damage_from: IDamageRelation[];
        [key:string]: IDamageRelation[];
    };
}

export function typeToNodes(response: ITypeResponse): INode[] {
    const x = [
        { key: 'half_damage_from', multiplier: 0.5, direction: 'from' },
        { key: 'no_damage_from', multiplier: 0, direction: 'from' },
        { key: 'half_damage_to', multiplier: 0.5, direction: 'to' },
        { key: 'double_damage_from', multiplier: 2, direction: 'from' },
        { key: 'no_damage_to', multiplier: 0, direction: 'to' },
        { key: 'double_damage_to', multiplier: 2, direction: 'to' },
    ];

    return x.reduce((acc, curr) => {
        const nodes: INode[] = response.damage_relations[curr.key].map((relation) => {
            return {
                name: relation.name,
                multiplier: curr.multiplier,
                direction: curr.direction as Direction,
            };
        });

        return acc.concat(nodes);
    }, []);
}

export function nodesForTypes(typeDict: PokemonTypeDict, types: PokemonType[]): INode[] {
    const combined: {[key in PokemonType]: number} = {} as {[key in PokemonType]: number};
    types.forEach(type => {
        typeDict[type].forEach(node => {
            if (node.direction === 'from') {
                if (combined[node.name] === undefined) {
                    combined[node.name] = 1;
                }
                combined[node.name] = combined[node.name] * node.multiplier;
            }
        });
    });
    const nodes: INode[] = Object.entries(combined)
      .filter(([name, multiplier]) => multiplier !== 1)
      .map(([name, multiplier]) => ({
          name: name as PokemonType,
          direction: 'from',
          multiplier,
      }));
    return nodes;
}
