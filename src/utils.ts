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

    getPokemonName: () => string;
    getFirstType: () => PokemonType;
    getSecondType: () => PokemonType;

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

const NODE_SIZE_FACTOR = 0.07;

export function nodeRadius(node: INode): number {
    let radius = 1;
    if (node.multiplier === 0 ) {
        radius = 0.1;
    } else if (node.multiplier === 0.25) {
        radius = 0.5;
    } else if (node.multiplier === 0.5) {
        radius = 1 / Math.sqrt(2);
    } else if (node.multiplier === 2) {
        radius = Math.sqrt(2);
    } else if (node.multiplier === 4) {
        radius = 2;
    }
    return radius * NODE_SIZE_FACTOR;
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
