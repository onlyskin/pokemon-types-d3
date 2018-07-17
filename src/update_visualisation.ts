import * as d3 from 'd3';
import * as m from 'mithril';
import { Pokedex } from 'pokeapi-js-wrapper';
import { ITypeResponse, PokemonType, INode } from './type_to_nodes';
import { focusedType, hoveredNode, nodeRadius } from './utils';
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

function updateFocusedType(newType: PokemonType) {
    if (newType === focusedType()) {
        return;
    }

    focusedType(newType);
    m.redraw();
}

function updateHoveredNode(newNode?: INode) {
    if (newNode === hoveredNode()) {
        return;
    }

    hoveredNode(newNode);
    m.redraw();
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
        height: number,
        width: number,
    ) => d3.Simulation<INode, undefined>,
    focusedUpdated: boolean,
) {
    const boundingRect = (svg.getBoundingClientRect() as DOMRect);
    const width = boundingRect.width;
    const height = boundingRect.height;
    svg.setAttribute('width', width.toString());
    svg.setAttribute('height', height.toString());

    const root = d3.select(svg);

    const updatingFocus = root
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

    const updatingTitle = root
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

    if (focusedUpdated) {
        pokedex.getTypeByName(focused)
            .then(function(response: ITypeResponse) {
                const nodeTransition = d3.transition()
                    .duration(600);

                const simulation = forceSimulation(height, width);
                const nodes: INode[] = type_to_nodes(response);

                preloadData(nodes);

                simulation.nodes(nodes);
                tick(simulation);

                const updatingNodes = root
                    .selectAll<Element, INode>('circle')
                    .data<INode>(nodes, d => {
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
                    .attr('r', d => nodeRadius(d, width));

                exitingNodes
                    .transition(nodeTransition)
                    .attr('r', 0)
                    .remove();
            });
    }
}
