import m from 'mithril';
import * as d3 from 'd3';
import { INode } from './type_to_nodes';
import { updateVisualisation } from './update_visualisation';
import { PokemonType, boundingDimensions, IState, PokemonTypeDict, PokemonDataDict } from './utils';
import { forceSimulation } from './simulation';
import { ResultPokedex } from './pokedex';

class State implements IState {
    private pokemonTypeDict: PokemonTypeDict;
    private pokemonDataDict: PokemonDataDict;

    hoveredNode: INode | undefined;
    activeTransition: boolean;
    pokemonName: string;
    pokemonInputText: string;
    firstType: PokemonType;
    firstTypeInputText: string;
    secondType: PokemonType | undefined;
    secondTypeInputText: string;

    constructor(pokemonTypeDict, pokemonDataDict) {
        this.pokemonTypeDict = pokemonTypeDict;
        this.pokemonDataDict = pokemonDataDict;

        this.activeTransition = false;
        this.hoveredNode = undefined;

        const defaultPokemon = pokemonDataDict['bulbasaur'];

        this.pokemonName = defaultPokemon.name;
        this.pokemonInputText = defaultPokemon.name;

        this.firstType = defaultPokemon.types[0];
        this.firstTypeInputText = defaultPokemon.types[0];

        this.secondType = defaultPokemon.types[1];
        this.secondTypeInputText = defaultPokemon.types[1];
    }

    setActiveTransition(isActive: boolean) {
        this.activeTransition = isActive;
    }

    setHoveredNode(newNode?: INode) {
        if (newNode === this.hoveredNode || this.activeTransition) {
            return;
        } else {
            this.hoveredNode = newNode;
            m.redraw();
        }
    }

    setPokemonInputText(text: string) {
        this.pokemonInputText = text;
        m.redraw();
    }

    setPokemonName(name: string) {
        if (name === undefined) {
            this.pokemonName = undefined;
            this.pokemonInputText = '';
            m.redraw();
        }
        
        const pokemon = this.pokemonDataDict[name];
        if (pokemon !== undefined) {
            this.pokemonName = pokemon.name;
            this.pokemonInputText = pokemon.name;

            this.firstType = pokemon.types[0];
            this.firstTypeInputText = this.firstType;

            if (pokemon.types.length === 2) {
                this.secondType = pokemon.types[1];
                this.secondTypeInputText = this.secondType;
            } else {
                this.secondType = undefined;
                this.secondTypeInputText = '';
            }
            m.redraw();
        }
    }

    setFirstType(type: string) {
        if (this.pokemonTypeDict[type] !== undefined) {
            this.firstType = type as PokemonType;
            this.firstTypeInputText = type;

            this.pokemonName = undefined;
            this.pokemonInputText = '';
            m.redraw();
        }
    }

    setFirstTypeInputText(text: string) {
        this.firstTypeInputText = text;
        m.redraw();
    }

    setSecondType(type: string) {
        if (type === '' || type === undefined) {
            this.secondType = undefined;
            this.secondTypeInputText = '';
        } else if (this.pokemonTypeDict[type] !== undefined) {
            this.secondType = type as PokemonType;
            this.secondTypeInputText = type;
            m.redraw();
        }
    }

    setSecondTypeInputText(text: string) {
        this.secondTypeInputText = text;
        m.redraw();
    }
};

function visualisationTitle(state: IState): string {
    const hovered = state.hoveredNode;
    const firstType = state.firstType;

    if (hovered === undefined) {
        return '';
    }

    let attacking;
    let defending;

    if (hovered.direction === 'from') {
        attacking = hovered.name;
        defending = firstType;
    } else {
        attacking = firstType;
        defending = hovered.name;
    }

    return `${attacking} gets ${hovered.multiplier}x against ${defending}`;
}

interface VisualisationAttrs {
    simulation: d3.Simulation<INode, undefined>;
    state: IState;
    pokemonTypeDict: PokemonTypeDict;
    pokemonDataDict: PokemonDataDict;
}

const Visualisation: m.ClosureComponent<VisualisationAttrs> = function({attrs: {state}}) {
    let oldFirst: PokemonType = state.firstType;

    function domComputations(state: IState, dom: Element, pokemonDataDict: PokemonDataDict) {
        updateFocusedText(state, dom, pokemonDataDict);
        updateTitle(state, dom);
    }

    function updateFocusedText(state: IState, dom: Element, pokemonDataDict: PokemonDataDict) {
        const {height, width} = boundingDimensions(dom);
        const el = dom.querySelector('#focused-text');
        el.setAttribute('x', (width * 0.5).toString());
        el.setAttribute('y', (height * 0.5).toString());
        el.textContent = state.firstType;
    }

    function updateTitle(state: IState, dom: Element) {
        const {height, width} = boundingDimensions(dom);
        const el = dom.querySelector('#title-text');
        el.setAttribute('x', (width * 0.5).toString());
        el.setAttribute('y', (height * 0.125).toString());
        el.textContent = visualisationTitle(state);
    }

    return {
        oncreate: function({attrs: {simulation, state, pokemonTypeDict, pokemonDataDict}, dom}) {
            const nodes = pokemonTypeDict[state.firstType];
            //const nodes = nodesForPokemon(pokemonTypeDict, pokemonDataDict[state.pokemonName]);
            updateVisualisation(dom, simulation, state, nodes);
            domComputations(state, dom, pokemonDataDict);
        },
        onupdate: function({attrs: {simulation, state, pokemonTypeDict, pokemonDataDict}, dom}) {
            const firstTypeUpdated = state.firstType !== oldFirst;

            if (firstTypeUpdated) {
                const nodes = pokemonTypeDict[state.firstType];
                //const nodes = nodesForPokemon(pokemonTypeDict, pokemonDataDict[state.pokemonName]);
                updateVisualisation(dom, simulation, state, nodes);
            }

            oldFirst = state.firstType;
            domComputations(state, dom, pokemonDataDict);
        },
        view: () => m(
            'svg',
            {
                version: '1',
                xmlns: 'http://www.w3.org/2000/svg',
            },
            m('text#focused-text', {}, 'bug'),
            m('text#title-text', {}, 'bug'),
        ),
    }
};

window.addEventListener('resize', () => {
    m.redraw();
});

const simulation = forceSimulation();
const resultPokedex = new ResultPokedex();

const PageInputs = {
    view: ({attrs: {pokemonDataDict, pokemonTypeDict, state}}) => m(
        '',
        [
            m(
               'input',
               {
                   'type': 'search',
                   'list': 'pokemon-list',
                   'value': state.pokemonInputText,
                   oninput: e => {
                       state.setPokemonInputText(e.srcElement.value);
                   },
                   onsearch: e => {
                       state.setPokemonName(e.srcElement.value);
                   },
               },
            ),
            m(
                'datalist#pokemon-list',
                Object.keys(pokemonDataDict).map(name => m('option', {value: name}))
            ),
            m(
               'input',
               {
                   'type': 'search',
                   'list': 'types-list',
                   'value': state.firstTypeInputText,
                   oninput: e => {
                       state.setFirstTypeInputText(e.srcElement.value);
                   },
                   onsearch: e => {
                       state.setFirstType(e.srcElement.value);
                   },
               },
            ),
            m(
               'input',
               {
                   'type': 'search',
                   'list': 'types-list',
                   'value': state.secondTypeInputText,
                   oninput: e => {
                       state.setSecondTypeInputText(e.srcElement.value);
                   },
                   onsearch: e => {
                       state.setSecondType(e.srcElement.value);
                   },
               },
            ),
            m(
                'datalist#types-list',
                Object.keys(pokemonTypeDict).map(type => m('option', {value: type}))
            ),
        ],
    ),
}

interface PageWithDataAttrs {
    pokemonTypeDict: PokemonTypeDict;
    pokemonDataDict: PokemonDataDict;
}

const PageWithData: m.ClosureComponent<PageWithDataAttrs> = function({attrs: {pokemonTypeDict, pokemonDataDict}}) {
    const state = new State(pokemonTypeDict, pokemonDataDict);

    return {
        view: ({attrs: {pokemonTypeDict, pokemonDataDict}}) => [
            m(
                Visualisation,
                {
                    state,
                    simulation,
                    pokemonTypeDict: resultPokedex.getTypeNodes().value,
                    pokemonDataDict: resultPokedex.getPokemonData().value,
                }
            ),
            m(PageInputs, {
                state,
                pokemonTypeDict: resultPokedex.getTypeNodes().value,
                pokemonDataDict: resultPokedex.getPokemonData().value,
            }),
        ]
    };
}

m.mount(document.body, {
    view: () => (resultPokedex.getTypeNodes().status === 'SUCCESS' &&
                 resultPokedex.getPokemonData().status === 'SUCCESS') ?
                 m(
                     PageWithData,
                     {
                         pokemonTypeDict: resultPokedex.getTypeNodes().value,
                         pokemonDataDict: resultPokedex.getPokemonData().value,
                     },
    ) : null,
});
