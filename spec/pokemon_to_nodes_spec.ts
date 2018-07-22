import * as o from 'ospec';
import { ITypeResponse, INode } from '../src/type_to_nodes';
import pokemonTypesToNodes from '../src/pokemon_to_nodes';

o('it gets pokemon types', () => {
    const typeResponses: ITypeResponse[] = [
        {
            "name": "flying",
            "damage_relations": {
                "half_damage_from": [{"name": "fighting"}, {"name": "bug"}, {"name": "grass"}],
                "no_damage_from": [{"name": "ground"}],
                "half_damage_to": [{"name": "rock"}, {"name": "steel"}, {"name": "electric"}],
                "double_damage_from": [{"name": "rock"}, {"name": "electric"}, {"name": "ice"}],
                "no_damage_to": [],
                "double_damage_to": [{"name": "fighting"}, {"name": "bug"}, {"name": "grass"}]
            },
        },
        {
            "name": "water",
            "damage_relations": {
                "half_damage_from": [{"name": "steel"}, {"name": "fire"}, {"name": "water"}, {"name": "ice"}],
                "no_damage_from": [],
                "half_damage_to": [{"name": "water"}, {"name": "grass"}, {"name": "dragon"}],
                "double_damage_from": [{"name": "grass"}, {"name": "electric"}],
                "no_damage_to": [],
                "double_damage_to": [{"name": "ground"}, {"name": "rock"}, {"name": "fire"}]
            },
        }
    ];

    const nodes: INode[] = pokemonTypesToNodes(typeResponses);

    const expected: INode[] = [
        { name: 'bug', multiplier: 0.5, direction: 'from' },
        { name: 'electric', multiplier: 4, direction: 'from' },
        { name: 'fighting', multiplier: 0.5, direction: 'from' },
        { name: 'fire', multiplier: 0.5, direction: 'from' },
        { name: 'ground', multiplier: 0, direction: 'from' },
        { name: 'rock', multiplier: 2, direction: 'from' },
        { name: 'steel', multiplier: 0.5, direction: 'from' },
        { name: 'water', multiplier: 0.5, direction: 'from' },
    ];
    o(nodes).deepEquals(expected);
});
