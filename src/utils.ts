import { PokemonType, INode } from './type_to_nodes';

export interface IState {
    focusedType: () => PokemonType;
    hoveredNode: () => INode | undefined;
    activeTransition: boolean;
    setFocusedType: (newType: PokemonType) => undefined;
    setHoveredNode: (newNode?: INode) => undefined;
    setActiveTransition: (isActive: boolean) => undefined;
}

const NODE_SIZE_FACTOR = 0.03;

export function nodeRadius(node: INode): number {
    return (node.multiplier === 0 ? 0.1 : node.multiplier) * NODE_SIZE_FACTOR;
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
