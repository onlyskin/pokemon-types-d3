import * as m from 'mithril';
import * as d3 from 'd3';
import * as stream from 'mithril/stream';
import { Pokedex } from 'pokeapi-js-wrapper';
import { ITypeResponse, PokemonType, INode } from './type_to_nodes';
import type_to_nodes from './type_to_nodes';

const pokedex = new Pokedex({
    protocol: 'https',
    cache: true,
    timeout: 5 * 1000,
});

function id<T>(x: T): T {
    return x;
}

const height = 400;
const width = 400;

function updateVisualisation(svg: Element, focused: PokemonType) {
    const root = d3.select(svg);

    const updatingFocus = root
        .selectAll('.focused')
        .data<PokemonType>([focused], d => (d as string));

    updatingFocus
        .enter()
        .append('text')
        .classed('focused', true)
        .attr('x', width / 2)
        .attr('y', height / 2)
        .text(id);

    updatingFocus
        .exit()
        .remove();

    pokedex.getTypeByName(focused)
        .then(function(response: ITypeResponse) {
            const nodes = type_to_nodes(response);
            const CIRCLE = 'circle';

            const updatingNodes = root
                .selectAll<Element, INode>(CIRCLE)
                .data<INode>(nodes, d => {
                    return `${d.name}-${d.direction}`
                });

            const mergedNodes = updatingNodes
                .enter()
                .append(CIRCLE)
                .merge(updatingNodes);

            const exitingNodes = updatingNodes
                .exit();

            mergedNodes
                .attr('class', (d) => d.name)
                .attr('cx', (d, i) => i * 10)
                .attr('cy', (d, i) => i * 10)
                .attr('r', (d) => d.multiplier * 10);

            exitingNodes
                .remove();
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

const focusedType = stream<PokemonType>('fire');

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
