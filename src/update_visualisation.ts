import * as d3 from 'd3';
import * as m from 'mithril';
import { Pokedex } from 'pokeapi-js-wrapper';
import { ITypeResponse, PokemonType, INode } from './type_to_nodes';
import { focusedType, HEIGHT, SVG_WIDTH, nodeRadius } from './utils';
import type_to_nodes from './type_to_nodes';

const pokedex = new Pokedex({
    protocol: 'https',
    cache: true,
    timeout: 5 * 1000,
});

function id<T>(x: T): T {
    return x;
}

function updateFocusedType(newType: PokemonType) {
    focusedType(newType);
    m.redraw();
}

export function updateVisualisation(
    svg: Element,
    focused: PokemonType,
    simulation: d3.Simulation<INode, undefined>,
) {
    const nodeTransition = d3.transition()
        .duration(600);

    const root = d3.select(svg);

    const updatingFocus = root
        .selectAll('.focused')
        .data<PokemonType>([focused], d => (d as string));

    updatingFocus
        .enter()
        .append('text')
        .classed('focused', true)
        .attr('x', SVG_WIDTH() / 2)
        .attr('y', HEIGHT / 2)
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

            const enteringNodes = updatingNodes
                .enter()
                .append(CIRCLE);

            const mergedNodes = enteringNodes
                .merge(updatingNodes);

            const exitingNodes = updatingNodes
                .exit();

            enteringNodes
                .attr('class', (d) => d.name)
                .attr('cx', (d) => d.x)
                .attr('cy', (d) => d.y)
                .on('click', (d) => updateFocusedType(d.name))
                .attr('r', 0);

            mergedNodes
                .transition(nodeTransition)
                .attr('cx', (d) => d.x)
                .attr('cy', (d) => d.y)
                .attr('r', nodeRadius);

            exitingNodes
                .transition(nodeTransition)
                .attr('r', 0)
                .remove();
        });

}
