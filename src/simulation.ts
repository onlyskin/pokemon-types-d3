import * as d3 from 'd3';
import { INode } from './type_to_nodes';
import { nodeRadius } from './utils';

const NODE_SPACING_FACTOR = 0.005;
const CENTRE_REPULSION = -0.03;
const X_STRENGTH = 0.3;

export function forceSimulation(): d3.Simulation<INode, undefined> {
    const collisionForce = d3.forceCollide<INode>(d => {
        return nodeRadius(d) + NODE_SPACING_FACTOR;
    });

    const xForce = d3.forceX<INode>(d => {
        return d.direction === 'from' ? 0.25 : 0.75;
    }).strength(X_STRENGTH);

    return d3.forceSimulation<INode>()
        .force("collision", collisionForce)
        .force("x", xForce)
        .force("antiCenter", d3.forceX<INode>(0.5).strength(CENTRE_REPULSION))
        .force("y", d3.forceY(0.5))
        .stop();
}

export function tick(simulation: d3.Simulation<INode, undefined>): void {
    simulation.alpha(1);
    for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
        simulation.tick();
    }
}
