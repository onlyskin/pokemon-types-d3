import stream from 'mithril/stream';
import m from 'mithril';
import { PokemonType, INode } from './type_to_nodes';

export const focusedType = stream<PokemonType>('fire');

export const hoveredNode = stream<INode | undefined>(undefined);

const NODE_SIZE_FACTOR = 0.03;

export function nodeRadius(node: INode): number {
    return (node.multiplier === 0 ? 0.1 : node.multiplier) * NODE_SIZE_FACTOR;
}

export function updateFocusedType(newType: PokemonType) {
    if (newType === focusedType()) {
        return;
    }

    focusedType(newType);
    m.redraw();
}

export function updateHoveredNode(newNode?: INode) {
    if (newNode === hoveredNode()) {
        return;
    }

    hoveredNode(newNode);
    m.redraw();
}

export function boundingDimensions(svg: Element) {
    const boundingRect = (svg.getBoundingClientRect() as DOMRect);
    const width = boundingRect.width;
    const height = boundingRect.height;
    return { width, height };
}

export function boundingWidth(svg: Element) {
    return boundingDimensions(svg).width;
}

export function visualisationTitle(hovered: INode, focused: PokemonType): string {
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
