import * as d3 from 'd3';
import { INode } from './type_to_nodes';
import { nodeRadius } from './utils';

export function forceSimulation(
    height: number,
    width: number,
): d3.Simulation<INode, undefined> {
    return d3.forceSimulation<INode>()
    .force("collision", d3.forceCollide<INode>(d => nodeRadius(d, width) + width * 0.005))
        .force("x", d3.forceX<INode>(d => {
            return d.direction === 'from' ? width / 4 : 3 * width / 4;
        }))
        .force("y", d3.forceY(height / 2))
        .stop();
}

export function tick(simulation: d3.Simulation<INode, undefined>): void {
    simulation.alpha(1);
    for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
        simulation.tick();
    }
}
