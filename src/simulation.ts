import * as d3 from 'd3';
import { INode } from './type_to_nodes';
import { nodeRadius } from './utils';

function nodePadding(svgWidth: number): number {
    return svgWidth * 0.005;
}

export function forceSimulation(
    height: number,
    width: number,
): d3.Simulation<INode, undefined> {
    const collisionForce = d3.forceCollide<INode>(d => {
        return nodeRadius(d, width) + nodePadding(width);
    });

    const xForce = d3.forceX<INode>(d => {
        return d.direction === 'from' ? width / 4 : 3 * width / 4;
    }).strength(0.3);

    return d3.forceSimulation<INode>()
        .force("collision", collisionForce)
        .force("x", xForce)
        .force("y", d3.forceY(height / 2))
        .stop();
}

export function tick(simulation: d3.Simulation<INode, undefined>): void {
    simulation.alpha(1);
    for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
        simulation.tick();
    }
}
