import { PokemonType } from '../src/index';
type Direction = 'from' | 'to';

interface INode {
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
    const x = [
        { key: 'half_damage_from', multiplier: 0.5, direction: 'from' },
        { key: 'no_damage_from', multiplier: 0, direction: 'from' },
        { key: 'half_damage_to', multiplier: 0.5, direction: 'to' },
        { key: 'double_damage_from', multiplier: 2, direction: 'from' },
        { key: 'no_damage_to', multiplier: 0, direction: 'to' },
        { key: 'double_damage_to', multiplier: 2, direction: 'to' },
    ] as any[];

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
