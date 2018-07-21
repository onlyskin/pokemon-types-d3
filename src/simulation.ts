import * as d3 from 'd3';
import { INode } from './type_to_nodes';
import { boundingDimensions, boundingWidth } from './utils';

const NODE_SIZE_FACTOR = 0.03;
const NODE_SPACING_FACTOR = 0.005;
const CENTRE_REPULSION = -0.03;
const X_STRENGTH = 0.3;
const Y_STRENGTH = 0.3;
const HALF = 0.5;

function nodePadding(svg: Element): number {
    return boundingWidth(svg) * NODE_SPACING_FACTOR;
}

export function nodeRadius(node: INode, svg: Element): number {
    const radiusScale = node.multiplier === 0 ? 0.1 : node.multiplier;
    return radiusScale * boundingWidth(svg) * NODE_SIZE_FACTOR;
}

export function forceSimulation(
    svg: Element
): d3.Simulation<INode, undefined> {
    const { height, width } = boundingDimensions(svg);

    const collisionForce = d3.forceCollide<INode>(d => {
        return nodeRadius(d, svg) + nodePadding(svg);
    });

    const xForce = d3.forceX<INode>(d => {
        return d.direction === 'from' ? width * 0.25 : width * 0.75;
    }).strength(X_STRENGTH);

    const yForce = d3.forceY<INode>( d => {
        return d.multiplier === 1 ? height * 0.6 : height * 0.4;
    }).strength(Y_STRENGTH);

    return d3.forceSimulation<INode>()
        .force("collision", collisionForce)
        .force("x", xForce)
        .force("antiCenter", d3.forceX<INode>(width * HALF).strength(CENTRE_REPULSION))
        .force("y", yForce)
        .stop();
}

export function tick(simulation: d3.Simulation<INode, undefined>): void {
    simulation.alpha(1);
    for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
        simulation.tick();
    }
}
