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

function nodeRadius(node: INode): number {
    return node.multiplier * 10;
}

const height = 400;
const width = 400;

function updateVisualisation(
    svg: Element,
    focused: PokemonType,
    simulation: d3.Simulation<INode, undefined>,
) {
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
            const nodes: INode[] = type_to_nodes(response);
            const CIRCLE = 'circle';

            simulation.nodes(nodes);
            simulation.alpha(1);

            for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
                simulation.tick();
            }

            const updatingNodes = root
                .selectAll<Element, INode>(CIRCLE)
                .data<INode>(nodes, d => {
                    return `${d.name}-${d.direction}`;
                });

            const mergedNodes = updatingNodes
                .enter()
                .append(CIRCLE)
                .merge(updatingNodes);

            const exitingNodes = updatingNodes
                .exit();

            mergedNodes
                .attr('class', (d) => d.name)
                .attr('cx', (d) => d.x)
                .attr('cy', (d) => d.y)
                .attr('r', nodeRadius);

            exitingNodes
                .remove();
        });

}

const Visualisation: m.Component<{
    focused: PokemonType,
    simulation: d3.Simulation<INode, undefined>,
}, {}> = {
    oncreate: ({attrs: {focused, simulation}, dom}) => {
        updateVisualisation(dom, focused, simulation);
    },
    onupdate: ({attrs: {focused, simulation}, dom}) => {
        updateVisualisation(dom, focused, simulation)
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

const simulation = d3.forceSimulation<INode>()
    .force("collision", d3.forceCollide(d => nodeRadius(d) + 1))
    .force("x", d3.forceX(d => d.direction === 'from' ? 100 : 300))
    .force("y", d3.forceY(height / 2))
    .stop();

m.mount(document.body, {
    view: () => {
        return [
            m('button', {
                onclick: () => {
                    focusedType('dragon');
                },
            }, 'click me'),
            m(Visualisation, {
                focused: focusedType(),
                simulation,
            }),
        ];
    }
});
