import * as stream from 'mithril/stream';
import { PokemonType, INode } from './type_to_nodes';

export function nodeRadius(node: INode, width): number {
    return node.multiplier * width * 0.02;
}

export const focusedType = stream<PokemonType>('fire');
