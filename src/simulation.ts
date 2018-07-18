import * as d3 from 'd3';
import { INode } from './type_to_nodes';
import { boundingDimensions, boundingWidth } from './utils';

function nodePadding(svg: Element): number {
    return boundingWidth(svg) * 0.005;
}

export function nodeRadius(node: INode, svg: Element): number {
    return node.multiplier * boundingWidth(svg) * 0.03;
}

export function forceSimulation(
    svg: Element
): d3.Simulation<INode, undefined> {
    const { height, width } = boundingDimensions(svg);

    const collisionForce = d3.forceCollide<INode>(d => {
        return nodeRadius(d, svg) + nodePadding(svg);
    });

    const xForce = d3.forceX<INode>(d => {
        return d.direction === 'from' ? width / 4 : 3 * width / 4;
    }).strength(0.3);

    return d3.forceSimulation<INode>()
        .force("collision", collisionForce)
        .force("x", xForce)
        .force("antiCenter", d3.forceX<INode>(width / 2).strength(-0.03))
        .force("y", d3.forceY(height / 2))
        .stop();
}

export function tick(simulation: d3.Simulation<INode, undefined>): void {
    simulation.alpha(1);
    for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
        simulation.tick();
    }
}
