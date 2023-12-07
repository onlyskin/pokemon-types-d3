import * as d3 from 'd3';
import { INode } from './type_to_nodes';
import { boundingDimensions, nodeRadius, IState } from './utils';
import { tick } from './simulation';

export async function updateVisualisation(
    svg: Element,
    simulation: d3.Simulation<INode, undefined>,
    state: IState,
    nodes: INode[],
): Promise<void> {
    const { width, height } = boundingDimensions(svg);
    svg.setAttribute('width', width.toString());
    svg.setAttribute('height', height.toString());

    simulation.nodes(nodes);
    tick(simulation);
    updateCircles(svg, simulation, state);
}

function updateCircles(
    svg: Element,
    simulation: d3.Simulation<INode, undefined>,
    state: IState,
): void {
    const { width, height } = boundingDimensions(svg);
    const nodeTransition = d3.transition('circles')
        .duration(600)
        .on('start', () => {
            state.setActiveTransition(true);
        })
        .on('end', () => {
            state.setActiveTransition(false);
        });

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
            state.setFirstType(d.name);
            state.setSecondType(undefined);
            state.setHoveredNode(undefined);
            state.setActiveTransition(true);
        })
        .on('mouseover', d => {
            state.setHoveredNode(d);
        })
        .on('mousemove', d => {
            state.setHoveredNode(d);
        })
        .on('mouseout', d => {
            state.setHoveredNode(undefined);
        })
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
