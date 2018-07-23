import * as d3 from 'd3';
import { boundingDimensions, boundingWidth } from './actions';

export type PokemonType = 'normal' | 'fire' | 'fighting' | 'water' | 'flying' | 'grass' | 'poison' | 'electric' | 'ground' | 'psychic' | 'rock' | 'ice' | 'bug' | 'dragon' | 'ghost' | 'dark' | 'steel' | 'fairy';

export type Direction = 'from' | 'to';

export interface INode extends d3.SimulationNodeDatum {
    name: PokemonType;
    multiplier: number;
    direction: Direction;
}

const NODE_SIZE_FACTOR = 0.03;
const NODE_SPACING_FACTOR = 0.005;
const CENTRE_REPULSION = -0.03;
const X_STRENGTH = 0.3;
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
        return width / 3;
    }).strength(X_STRENGTH);

    return d3.forceSimulation<INode>()
        .force("collision", collisionForce)
        .force("x", xForce)
        .force("antiCenter", d3.forceX<INode>(width * HALF).strength(CENTRE_REPULSION))
        .force("y", d3.forceY(height * HALF).strength(0.3))
        .stop();
}

export function tick(simulation: d3.Simulation<INode, undefined>): void {
    simulation.alpha(1);
    for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
        simulation.tick();
    }
}
