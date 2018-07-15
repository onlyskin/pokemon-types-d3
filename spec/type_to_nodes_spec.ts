import * as o from 'ospec';
import { ITypeResponse } from '../src/type_to_nodes';
import typeToNodes from '../src/type_to_nodes';

o('it should parse type json', () => {
    const response: ITypeResponse = {
        'name': 'fire',
        'damage_relations': {
            'half_damage_from': [ { 'name': 'bug' }, { 'name': 'steel' } ],
            'no_damage_from': [ { 'name': 'fairy' } ],
            'half_damage_to': [ { 'name': 'rock' }, { 'name': 'fire' } ],
            'double_damage_from': [ { 'name': 'ground' }, { 'name': 'water' } ],
            'no_damage_to': [ { 'name': 'rock' } ],
            'double_damage_to': [ { 'name': 'bug' } ],
        },
    };

    o(typeToNodes(response)).deepEquals([
        { name: 'bug', multiplier: 0.5, direction: 'from' },
        { name: 'steel', multiplier: 0.5, direction: 'from' },
        { name: 'fairy', multiplier: 0, direction: 'from' },
        { name: 'rock', multiplier: 0.5, direction: 'to' },
        { name: 'fire', multiplier: 0.5, direction: 'to' },
        { name: 'ground', multiplier: 2, direction: 'from' },
        { name: 'water', multiplier: 2, direction: 'from' },
        { name: 'rock', multiplier: 0, direction: 'to' },
        { name: 'bug', multiplier: 2, direction: 'to' },
    ]);
});
