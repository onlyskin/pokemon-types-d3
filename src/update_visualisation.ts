import * as d3 from 'd3';
import { Pokedex } from 'pokeapi-js-wrapper';
import { ITypeResponse, PokemonType, INode } from './type_to_nodes';
import { boundingDimensions, focusedType, updateFocusedType, updateHoveredNode } from './utils';
import type_to_nodes from './type_to_nodes';
import { tick, nodeRadius } from './simulation';

const pokedex = new Pokedex({
    protocol: 'https',
    cache: true,
    timeout: 5 * 1000,
});

function id<T>(x: T): T {
    return x;
}

function preloadData(nodes: INode[]): void {
    nodes.map((node) => {
        pokedex.getTypeByName(node.name);
    });
}

export function updateVisualisation(
    svg: Element,
    focused: PokemonType,
    title: string,
    forceSimulation: (
        svg: Element
    ) => d3.Simulation<INode, undefined>,
    focusedUpdated: boolean,
) {
    const { width, height } = boundingDimensions(svg);
    svg.setAttribute('width', width.toString());
    svg.setAttribute('height', height.toString());

    updateFocus(svg, focused);
    updateTitle(svg, title);

    if (focusedUpdated) {
        pokedex.getTypeByName(focused)
            .then(function(response: ITypeResponse) {
                const nodes: INode[] = type_to_nodes(response);
                preloadData(nodes);

                const simulation = forceSimulation(svg);
                simulation.nodes(nodes);
                tick(simulation);

                updateNodes(svg, simulation);
            });
    }
}

function updateNodes(svg: Element, simulation: d3.Simulation<INode, undefined>) {
    const nodeTransition = d3.transition()
        .duration(600);

    const updatingNodes = d3.select(svg)
        .selectAll<Element, INode>('circle')
        .data<INode>(simulation.nodes(), d => {
            return `${d.name}-${d.direction}`;
        });

    const enteringNodes = updatingNodes
        .enter()
        .append<Element>('circle');

    const mergedNodes = enteringNodes
        .merge(updatingNodes);

    const exitingNodes = updatingNodes
        .exit();

    enteringNodes
        .attr('class', d => d.name)
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .on('click', function(d) {
            if (focusedType() === d.name) {
                return;
            }

            updateFocusedType(d.name);
            updateHoveredNode(undefined);
            this.dispatchEvent(new Event('mouseout'));
        })
        .on('mouseover', d => updateHoveredNode(d))
        .on('mouseout', d => updateHoveredNode(undefined))
        .attr('r', 0);

    mergedNodes
        .transition(nodeTransition)
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', d => nodeRadius(d, svg));

    exitingNodes
        .transition(nodeTransition)
        .attr('r', 0)
        .remove();
}

function updateFocus(svg: Element, focused: PokemonType) {
    const { width, height } = boundingDimensions(svg);

    const updatingFocus = d3.select(svg)
        .selectAll('.focused')
        .data<PokemonType>([focused], d => (d as string));

    updatingFocus
        .enter()
        .append('text')
        .merge(updatingFocus)
        .classed('focused', true)
        .attr('x', width / 2)
        .attr('y', height / 2)
        .text(id);

    updatingFocus
        .exit()
        .remove();
}

function updateTitle(svg: Element, title: string) {
    const { width, height } = boundingDimensions(svg);

    const updatingTitle = d3.select(svg)
        .selectAll('.title')
        .data<string>([title], d => (d as string));

    updatingTitle
        .enter()
        .append('text')
        .merge(updatingTitle)
        .classed('title', true)
        .attr('x', width / 2)
        .attr('y', height / 8)
        .text(id);

    updatingTitle
        .exit()
        .remove();
}
