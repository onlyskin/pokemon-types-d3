import * as o from 'ospec';
import { ITypeResponse, INode } from '../src/type_to_nodes';
import typeToNodes from '../src/type_to_nodes';

o('it should parse type json', () => {
    const response: ITypeResponse = {
        'name': 'fire',
        'damage_relations': {
            'half_damage_from': [ { 'name': 'bug' }, { 'name': 'steel' } ],
            'no_damage_from': [ { 'name': 'fairy' } ],
            'half_damage_to': [ { 'name': 'psychic' }, { 'name': 'fire' } ],
            'double_damage_from': [ { 'name': 'ground' }, { 'name': 'water' } ],
            'no_damage_to': [ { 'name': 'rock' } ],
            'double_damage_to': [ { 'name': 'bug' } ],
        },
    };

    const expectedNodes = [
        { name: 'bug', multiplier: 0.5, direction: 'from' },
        { name: 'steel', multiplier: 0.5, direction: 'from' },
        { name: 'fairy', multiplier: 0, direction: 'from' },
        { name: 'psychic', multiplier: 0.5, direction: 'to' },
        { name: 'fire', multiplier: 0.5, direction: 'to' },
        { name: 'ground', multiplier: 2, direction: 'from' },
        { name: 'water', multiplier: 2, direction: 'from' },
        { name: 'rock', multiplier: 0, direction: 'to' },
        { name: 'bug', multiplier: 2, direction: 'to' },
        { name: 'normal', multiplier: 1, direction: 'from' },
        { name: 'normal', multiplier: 1, direction: 'to' },
        { name: 'fighting', multiplier: 1, direction: 'from' },
        { name: 'fighting', multiplier: 1, direction: 'to' },
        { name: 'flying', multiplier: 1, direction: 'from' },
        { name: 'flying', multiplier: 1, direction: 'to' },
        { name: 'poison', multiplier: 1, direction: 'from' },
        { name: 'poison', multiplier: 1, direction: 'to' },
        { name: 'ground', multiplier: 1, direction: 'to' },
        { name: 'rock', multiplier: 1, direction: 'from' },
        { name: 'ghost', multiplier: 1, direction: 'from' },
        { name: 'ghost', multiplier: 1, direction: 'to' },
        { name: 'steel', multiplier: 1, direction: 'to' },
        { name: 'fire', multiplier: 1, direction: 'from' },
        { name: 'water', multiplier: 1, direction: 'to' },
        { name: 'grass', multiplier: 1, direction: 'from' },
        { name: 'grass', multiplier: 1, direction: 'to' },
        { name: 'electric', multiplier: 1, direction: 'from' },
        { name: 'electric', multiplier: 1, direction: 'to' },
        { name: 'psychic', multiplier: 1, direction: 'from' },
        { name: 'ice', multiplier: 1, direction: 'from' },
        { name: 'ice', multiplier: 1, direction: 'to' },
        { name: 'dragon', multiplier: 1, direction: 'from' },
        { name: 'dragon', multiplier: 1, direction: 'to' },
        { name: 'dark', multiplier: 1, direction: 'from' },
        { name: 'dark', multiplier: 1, direction: 'to' },
        { name: 'fairy', multiplier: 1, direction: 'to' },
    ] as INode[];

    const actualNodes = typeToNodes(response);
     
    o(actualNodes).deepEquals(expectedNodes);
});
