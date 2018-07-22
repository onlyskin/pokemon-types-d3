import * as windowMock from 'mithril/test-utils/browserMock';
(global as any).window = windowMock();
(global as any).document = window.document;
import * as o from 'ospec';
import { matching } from '../src/pokemon_input';

o('it should return the first matching pokemon', () => {
    const pokemon = ['bulbasaur', 'ivysaur', 'venusaur', 'bellsprout'];

    o(matching(pokemon, 'b', 4)).deepEquals(['bulbasaur', 'bellsprout']);
    o(matching(pokemon, 'b', 1)).deepEquals(['bulbasaur']);
    o(matching(pokemon, 'bll', 4)).deepEquals(['bellsprout']);
    o(matching(pokemon, 'v', 4)).deepEquals(['ivysaur', 'venusaur']);
    o(matching(pokemon, 've', 4)).deepEquals(['venusaur']);
    o(matching(pokemon, 'va', 4)).deepEquals(['ivysaur', 'venusaur']);
    o(matching(pokemon, 'bul', 4)).deepEquals(['bulbasaur']);
    o(matching(pokemon, 'xyz', 4)).deepEquals([]);
    o(matching(pokemon, '', 4).length).equals(4);
    o(matching(pokemon, '', 2).length).equals(2);
});
