import * as stream from 'mithril/stream';
import { PokemonType, INode } from './type_to_nodes';

export function nodeRadius(node: INode): number {
    return node.multiplier * 10;
}

export const focusedType = stream<PokemonType>('fire');
