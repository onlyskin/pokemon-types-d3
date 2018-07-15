import * as m from 'mithril';
import * as d3 from 'd3';
import * as stream from 'mithril/stream';
import { Pokedex } from 'pokeapi-js-wrapper';
import { ITypeResponse } from '../src/type_to_nodes';

const pokedex = new Pokedex({
    protocol: 'https',
    cache: true,
    timeout: 5 * 1000,
});

function id<T>(x: T): T {
    return x;
}

export type PokemonType = 'normal' | 'fire' | 'fighting' | 'water' | 'flying' | 'grass' | 'poison' | 'electric' | 'ground' | 'psychic' | 'rock' | 'ice' | 'bug' | 'dragon' | 'ghost' | 'dark' | 'steel' | 'fairy';

const height = 400;
const width = 400;

function updateVisualisation(svg: Element, focused: PokemonType) {
    const root = d3.select(svg);

    const updating = root
        .selectAll('.focused')
        .data<PokemonType>([focused], d => (d as string));

    updating
        .enter()
        .append('text')
        .classed('focused', true)
        .attr('x', width / 2)
        .attr('y', height / 2)
        .text(id);

    updating
        .exit()
        .remove();

    pokedex.getTypeByName(focused)
        .then(function(response: ITypeResponse) {
            console.log(response);
        });

}

const Visualisation: m.Component<{focused: PokemonType}, {}> = {
    oncreate: ({attrs: {focused}, dom}) => {
        updateVisualisation(dom, focused);
    },
    onupdate: ({attrs: {focused}, dom}) => {
        updateVisualisation(dom, focused)
    },
    view: ({attrs: {focused}}) => {
        return m(
            'svg',
            {
                version: '1',
                xmlns: 'http://www.w3.org/2000/svg',
                height,
                width,
            },
        );
    },
};

const focusedType = stream<PokemonType>('ghost');

m.mount(document.body, {
    view: () => {
        return [
            m('button', {
                onclick: () => {
                    focusedType('dragon');
                },
            }, 'click me'),
            m(Visualisation, {focused: focusedType()}),
        ];
    }
});
