import * as stream from 'mithril/stream';
import { PokemonType, INode } from './type_to_nodes';

export function nodeRadius(node: INode, svgWidth: number): number {
    return node.multiplier * svgWidth * 0.03;
}

export const focusedType = stream<PokemonType>('fire');
