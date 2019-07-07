import * as d3 from 'd3';
import { Pokedex } from 'pokeapi-js-wrapper';
import { PokemonType, INode } from './type_to_nodes';
import { boundingDimensions, focusedType, updateFocusedType, updateHoveredNode, nodeRadius } from './utils';
import type_to_nodes from './type_to_nodes';
import { tick } from './simulation';

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

export async function updateVisualisation(
    svg: Element,
    focused: PokemonType,
    title: string,
    simulation: d3.Simulation<INode, undefined>,
    focusedUpdated: boolean,
): Promise<void> {
    const { width, height } = boundingDimensions(svg);
    svg.setAttribute('width', width.toString());
    svg.setAttribute('height', height.toString());

    updateTitle(svg, title);

    if (focusedUpdated) {
        const response = await pokedex.getTypeByName(focused);
        const nodes: INode[] = type_to_nodes(response);
        preloadData(nodes);

        simulation.nodes(nodes);
        tick(simulation);

    }

    updateCircles(svg, simulation, focusedUpdated);
    updateFocused(svg, focused);
}


function updateFocused(svg: Element, focused: PokemonType): void {
    updateTextElement(svg, (focused as string), 'focused', 0.5, 0.5);
}

function updateTitle(svg: Element, title: string): void {
    updateTextElement(svg, title, 'title', 0.5, 0.125);
}

function updateTextElement(
    svg: Element,
    text: string,
    className: string,
    xMultiple: number,
    yMultiple: number,
): void {
    const { width, height } = boundingDimensions(svg);

    const updating = d3.select(svg)
        .selectAll(`.${className}`)
        .data<string>([text], d => (d as string));

    updating
        .enter()
        .append('text')
        .merge(updating)
        .classed(className, true)
        .attr('x', width * xMultiple)
        .attr('y', height * yMultiple)
        .text(id);

    updating
        .exit()
        .remove();
}

function updateCircles(
    svg: Element,
    simulation: d3.Simulation<INode, undefined>,
    focusedUpdated: boolean
): void {
    const { width, height } = boundingDimensions(svg);
    const nodeTransition = d3.transition()
        .duration(focusedUpdated ? 600 : 0);

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
        .attr('cx', d => d.x * width)
        .attr('cy', d => d.y * height)
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
        .attr('cx', d => d.x * width)
        .attr('cy', d => d.y * height)
        .attr('r', d => nodeRadius(d) * Math.min(width, height));
    exitingNodes
        .transition(nodeTransition)
        .attr('r', 0)
        .remove();
}
