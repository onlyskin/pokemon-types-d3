import { INode } from './type_to_nodes';

export type PokemonType = 'normal' | 'fire' | 'fighting' | 'water' | 'flying' | 'grass' | 'poison' | 'electric' | 'ground' | 'psychic' | 'rock' | 'ice' | 'bug' | 'dragon' | 'ghost' | 'dark' | 'steel' | 'fairy';

export type PokemonDataDict = {[name: string]: PokemonData};

export type PokemonTypeDict = {[key in PokemonType]: INode[]};

export interface PokemonData {
    name: string;
    types: PokemonType[];
    index: number;
}

export interface Result<T> {
    status: 'SUCCESS' | 'ERROR' | 'LOADING';
    value: T;
}

export interface IState {
    hoveredNode: INode | undefined;
    activeTransition: boolean;
    pokemonInputText: string;
    firstTypeInputText: string;
    secondTypeInputText: string;

    setHoveredNode: (newNode?: INode) => void;
    setActiveTransition: (isActive: boolean) => void;
    setPokemonName: (name: string) => void;
    setPokemonInputText: (text: string) => void;
    setFirstType: (newType: PokemonType) => void;
    setFirstTypeInputText: (text: string) => void;
    setSecondType: (newType: PokemonType) => void;
    setSecondTypeInputText: (text: string) => void;
    setRoute: (params: any) => void;
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
