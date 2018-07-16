import * as stream from 'mithril/stream';
import { PokemonType, INode } from './type_to_nodes';

export const HEIGHT = 600;

export function SVG_WIDTH() {
    const bodyWidth = document.body.getBoundingClientRect().width;
    return Math.max(500, bodyWidth);
}

export function nodeRadius(node: INode): number {
    return node.multiplier * 10;
}

export const focusedType = stream<PokemonType>('fire');
