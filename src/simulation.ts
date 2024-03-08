import * as d3 from 'd3';
import { INode } from './type_to_nodes';
import { nodeRadius } from './utils';

const NODE_SPACING_FACTOR = 0.004;

export function forceSimulation(): d3.Simulation<INode, undefined> {
    const collisionForce = d3.forceCollide<INode>(d => {
        return nodeRadius(d) + NODE_SPACING_FACTOR;
    });

    const boxingForce = (() => {
        const f = function(alpha) {
            for (let node of f.nodes) {
                const padding = 0.01;
                const radius = nodeRadius(node) + padding;
                node.x = Math.max(radius, Math.min(node.x, 1-radius));
                node.y = Math.max(radius, Math.min(node.y, 1-radius));
            }
        };
        f.nodes = [];
        f.initialize = (new_nodes) => {
            f.nodes = new_nodes;
        }
        return f;
    })();

    return d3.forceSimulation<INode>()
        .force("collision", collisionForce)
        .force("x", d3.forceX<INode>(d => d.direction === 'from' ? 0.2 : 0.8)
               .strength(1.2))
        .force("y", d3.forceY(0.6).strength(0.08))
        .force("bounds", boxingForce)
        .stop();
}

export function tick(simulation: d3.Simulation<INode, undefined>): void {
    simulation.alpha(1);
    for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
        simulation.tick();
    }
}
