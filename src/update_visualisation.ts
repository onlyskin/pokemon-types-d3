import * as d3 from 'd3';
import { Pokedex } from 'pokeapi-js-wrapper';
import { PokemonType, INode } from './type_to_nodes';
import { boundingDimensions, nodeRadius, IState } from './utils';
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
    simulation: d3.Simulation<INode, undefined>,
    focusedUpdated: boolean,
    state: IState,
): Promise<void> {
    const { width, height } = boundingDimensions(svg);
    svg.setAttribute('width', width.toString());
    svg.setAttribute('height', height.toString());

    updateTitle(svg, state);

    if (focusedUpdated) {
        const response = await pokedex.getTypeByName(state.focusedType());
        const nodes: INode[] = type_to_nodes(response);
        preloadData(nodes);

        simulation.nodes(nodes);
        tick(simulation);
    }

    updateCircles(svg, simulation, state);
    updateFocused(svg, state.focusedType());
}


function updateFocused(svg: Element, focused: PokemonType): void {
    updateTextElement(svg, (focused as string), 'focused', 0.5, 0.5);
}

export function visualisationTitle(state: IState): string {
    const hovered = state.hoveredNode();
    const focused = state.focusedType();

    if (hovered === undefined) {
        return '';
    }

    let attacking;
    let defending;

    if (hovered.direction === 'from') {
        attacking = hovered.name;
        defending = focused;
    } else {
        attacking = focused;
        defending = hovered.name;
    }

    return `${attacking} gets ${hovered.multiplier}x against ${defending}`;
}

function updateTitle(svg: Element, state: IState): void {
    updateTextElement(svg, visualisationTitle(state), 'title', 0.5, 0.125);
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
        .selectAll<Element, string>(`.${className}`)
        .data<string>([text], d => (d as string));

    updating
        .enter()
        .append<Element>('text')
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
    state: IState,
): void {
    const { width, height } = boundingDimensions(svg);
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
        .attr('cx', d => d.x * width)
        .attr('cy', d => d.y * height)
        .on('click', function(d) {
            if (state.focusedType() === d.name) {
                return;
            }

            state.setFocusedType(d.name);
            state.setHoveredNode(undefined);
            this.dispatchEvent(new Event('mouseout'));
        })
        .on('mouseover', d => state.setHoveredNode(d))
        .on('mouseout', d => state.setHoveredNode(undefined))
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
