import * as stream from 'mithril/stream';
import { PokemonType, INode } from './type_to_nodes';

export function nodeRadius(node: INode, svgWidth: number): number {
    return node.multiplier * svgWidth * 0.03;
}

export const focusedType = stream<PokemonType>('fire');

export const hoveredNode = stream<INode | undefined>(undefined);

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
