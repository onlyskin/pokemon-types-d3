type Direction = 'from' | 'to';

export type PokemonType = 'normal' | 'fighting' | 'flying' |
    'poison' | 'ground' | 'rock' | 'bug' | 'ghost' | 'steel' |
    'fire' | 'water' | 'grass' | 'electric' | 'psychic' | 'ice' |
    'dragon' | 'dark' | 'fairy';

const pokemonTypes: PokemonType[] = [
    'normal', 'fighting', 'flying', 'poison', 'ground', 'rock',
    'bug', 'ghost', 'steel', 'fire', 'water', 'grass',
    'electric', 'psychic', 'ice', 'dragon', 'dark', 'fairy',
];

export interface INode extends d3.SimulationNodeDatum {
    name: PokemonType;
    multiplier: number;
    direction: Direction;
}

interface IDamageRelation {
    name: PokemonType;
}

export interface ITypeResponse {
    name: string;
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

export default (response: ITypeResponse): INode[] => {
    const multipliers = [
        { key: 'half_damage_from', multiplier: 0.5, direction: 'from' },
        { key: 'no_damage_from', multiplier: 0, direction: 'from' },
        { key: 'half_damage_to', multiplier: 0.5, direction: 'to' },
        { key: 'double_damage_from', multiplier: 2, direction: 'from' },
        { key: 'no_damage_to', multiplier: 0, direction: 'to' },
        { key: 'double_damage_to', multiplier: 2, direction: 'to' },
    ] as any[];

    const someNodes: INode[] = multipliers.reduce((acc, curr) => {
        const damageRelations = response.damage_relations[curr.key];
        const nodes: INode[] = damageRelations.map((relation) => {
            return node(
                relation.name,
                curr.multiplier,
                curr.direction
            );
        });

        return acc.concat(nodes);
    }, []);

    const allNodes: INode[] = pokemonTypes.reduce((acc, curr) => {
        const missingTypeNodes: INode[] = [];

        if (!someNodes.find(n => {
            return n.name === curr && n.direction === 'from';
        })) {
            missingTypeNodes.push(node(curr, 1, 'from'));
        }

        if (!someNodes.find(n => {
            return n.name === curr && n.direction === 'to';
        })) {
            missingTypeNodes.push(node(curr, 1, 'to'));
        }

        return acc.concat(missingTypeNodes);
    }, someNodes);

    return allNodes;
}

function node(
    name: PokemonType,
    multiplier: number,
    direction: Direction,
) {
    return { name, multiplier, direction };
}
