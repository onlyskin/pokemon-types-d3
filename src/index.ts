import m from 'mithril';
import * as d3 from 'd3';
import { INode, nodesForTypes } from './type_to_nodes';
import { updateVisualisation } from './update_visualisation';
import { PokemonType, boundingDimensions, IState, PokemonTypeDict, PokemonDataDict } from './utils';
import { forceSimulation } from './simulation';
import { ResultPokedex } from './pokedex';

class State implements IState {
    private pokemonTypeDict: PokemonTypeDict;
    private pokemonDataDict: PokemonDataDict;

    hoveredNode: INode | undefined;
    activeTransition: boolean;
    pokemonInputText: string;
    firstTypeInputText: string;
    secondTypeInputText: string;

    constructor(pokemonTypeDict, pokemonDataDict) {
        this.pokemonTypeDict = pokemonTypeDict;
        this.pokemonDataDict = pokemonDataDict;

        this.activeTransition = false;
        this.hoveredNode = undefined;

        const routeTypesAreValid = m.route.param('f') || m.route.param('f') && m.route.param('s');

        if (!routeTypesAreValid) {
            const defaultPokemon = pokemonDataDict['bulbasaur'];
            m.route.set('/', {p: defaultPokemon.name, f: defaultPokemon.types[0], s: defaultPokemon.types[1]})
        }

        this.pokemonInputText = m.route.param('p');
        this.firstTypeInputText = m.route.param('f');
        this.secondTypeInputText = m.route.param('s');
    }

    setRoute(newParams) {
        this.setHoveredNode(undefined);

        const combinedParams = {...m.route.param(), ...newParams};

        this.pokemonInputText = combinedParams['p'];
        this.firstTypeInputText = combinedParams['f'];
        this.secondTypeInputText = combinedParams['s'];

        m.route.set('/', combinedParams);
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
    }

    setPokemonName(name: string) {
        const pokemon = this.pokemonDataDict[name];

        if (pokemon === undefined) {
            return;
        }

        const newRouteParams = {};

        if (name === undefined || name === '') {
            newRouteParams['p'] = undefined;
            this.pokemonInputText = '';
        } else {
            this.pokemonInputText = pokemon.name;
            newRouteParams['p'] = pokemon.name;

            const firstType = pokemon.types[0];
            newRouteParams['f'] = firstType;
            this.firstTypeInputText = firstType;

            if (pokemon.types.length === 2) {
                const secondType = pokemon.types[1];
                newRouteParams['s'] = secondType;
                this.secondTypeInputText = secondType;
            } else {
                newRouteParams['s'] = undefined;
                this.secondTypeInputText = '';
            }
        }

        this.setRoute(newRouteParams);
    }

    getPokemonName() {
        return m.route.param('p');
    }

    setFirstTypeInputText(text: string) {
        this.firstTypeInputText = text;
        m.redraw();
    }

    setFirstType(type: string) {
        if (this.pokemonTypeDict[type] !== undefined) {
            this.firstTypeInputText = type;

            this.setRoute({'p': undefined, 'f': type});
        }
    }

    getFirstType() {
        return m.route.param()['f'];
    }

    setSecondTypeInputText(text: string) {
        this.secondTypeInputText = text;
        m.redraw();
    }

    setSecondType(type: string) {
        const newRouteParams = {};
        if (type === '' || type === undefined) {
            newRouteParams['s'] = undefined;
            this.secondTypeInputText = '';
        } else if (this.pokemonTypeDict[type] !== undefined) {
            this.secondTypeInputText = type;
            newRouteParams['s'] = type;
            newRouteParams['p'] = undefined;
        }
        this.setRoute(newRouteParams);
    }

    getSecondType() {
        return m.route.param()['s'];
    }
};

function visualisationTitle(state: IState): string {
    const hovered = state.hoveredNode;
    const firstType = state.getFirstType();
    const secondType = state.getSecondType();

    if (hovered === undefined) {
        return '';
    }

    let attacking;
    let defending;

    if (hovered.direction === 'from') {
        attacking = hovered.name;
        defending = `${firstType}${secondType ? '+' : ''}${secondType}`;
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
    let oldFirst: PokemonType = state.getFirstType();
    let oldSecond: PokemonType = state.getSecondType();

    function domComputations(state: IState, dom: Element, pokemonDataDict: PokemonDataDict) {
        updateFocusedText(state, dom, pokemonDataDict);
        updateTitle(state, dom);
    }

    function updateFocusedText(state: IState, dom: Element, pokemonDataDict: PokemonDataDict) {
        const {height, width} = boundingDimensions(dom);
        const el = dom.querySelector('#focused-text');
        el.setAttribute('x', (width * 0.5).toString());
        el.setAttribute('y', (height * 0.5).toString());
        el.textContent = `${state.getFirstType()}${state.getSecondType() ? '+' : ''}${state.getSecondType()}`;
    }

    function updateTitle(state: IState, dom: Element) {
        const {height, width} = boundingDimensions(dom);
        const el = dom.querySelector('#title-text');
        el.setAttribute('x', (width * 0.5).toString());
        el.setAttribute('y', (height * 0.125).toString());
        el.textContent = visualisationTitle(state);
    }

    function getNodes(pokemonTypeDict, state) {
        const first = state.getFirstType();
        const second = state.getSecondType();

        if (second === undefined || second === '' || first === second) {
            return pokemonTypeDict[first];
        } else {
            return nodesForTypes(pokemonTypeDict, [first, second]);
        }
    }

    return {
        oncreate: function({attrs: {simulation, state, pokemonTypeDict, pokemonDataDict}, dom}) {
            updateVisualisation(dom, simulation, state, getNodes(pokemonTypeDict, state));
            domComputations(state, dom, pokemonDataDict);
        },
        onupdate: function({attrs: {simulation, state, pokemonTypeDict, pokemonDataDict}, dom}) {
            const newFirst = state.getFirstType();
            const newSecond = state.getSecondType();
            const typeUpdated = newFirst !== oldFirst || newSecond !== oldSecond;

            if (typeUpdated) {
                updateVisualisation(dom, simulation, state, getNodes(pokemonTypeDict, state));
            }

            oldFirst = newFirst;
            oldSecond = newSecond;
            domComputations(state, dom, pokemonDataDict);
        },
        view: () => m(
            'svg',
            {
                version: '1',
                xmlns: 'http://www.w3.org/2000/svg',
            },
            m('text#focused-text', {}, ''),
            m('text#title-text', {}, ''),
        ),
    }
};

window.addEventListener('resize', () => {
    m.redraw();
});

const simulation = forceSimulation();
const resultPokedex = new ResultPokedex(151, false);

const Sprite = {
    view: ({ attrs: { pokemonData: { index, name, animated_artwork, official_artwork }, state } }) => {
        const TARGET_SIZE = 60;
        const artwork_url = official_artwork;
        const isFocused = state.getPokemonName() === name;

        return m(
            `a.black.no-underline.ba.br-pill${isFocused ? '.b--light-green.bg-washed-green' : '.b--light-gray.bg-near-white'}.pa2.ma2.shadow-4`,
            {href: `https://bulbapedia.bulbagarden.net/wiki/${name}_(Pok%C3%A9mon)`},
            m(
                '.flex.justify-center.items-center.small-caps.f7.tc',
                {
                    'key': name,
                    'title': name,
                    'style': {
                        'height': TARGET_SIZE,
                        'width': TARGET_SIZE,
                        'background': `url(${artwork_url}) left 0px top 0px`,
                        'background-size': 'contain',
                        'background-repeat': 'no-repeat',
                        'background-position': 'center',
                    },
                },
                artwork_url === null ? name : null, 
            )
        )
    },
}

window.m = m;
interface PageInputsAttrs {
    pokemonTypeDict: PokemonTypeDict;
    pokemonDataDict: PokemonDataDict;
    state: IState;
}
const PageInputs: m.ClosureComponent<PageInputsAttrs> = function({attrs: {pokemonTypeDict, pokemonDataDict, state}}) {
    return {
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
                m(
                    '.flex.flex-wrap',
                    Object.values(pokemonDataDict)
                      .filter(pokemon => matchesRouteTypes(pokemon, state))
                      .map(pokemon => m(Sprite, {pokemonData: pokemon, state}))
                ),
            ],
        ),
    }
}

function matchesRouteTypes(pokemon: PokemonData, state: IState): boolean {
    const first = state.getFirstType();
    const second = state.getSecondType();
    if (second === undefined || second === '' || first === second) {
        return pokemon.types[0] === first && pokemon.types[1] === undefined;
    } else {
        return pokemon.types[0] === first && pokemon.types[1] === second ||
               pokemon.types[1] === first && pokemon.types[0] === second;
    }
}

interface PageWithDataAttrs {
    pokemonTypeDict: PokemonTypeDict;
    pokemonDataDict: PokemonDataDict;
}

const PageWithData: m.ClosureComponent<PageWithDataAttrs> = function({attrs: {pokemonTypeDict, pokemonDataDict}}) {
    let state;

    return {
        oninit: () => {
            state = new State(pokemonTypeDict, pokemonDataDict);
        },
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

m.route(document.body, '/', {
    '/': {
        view: () => (resultPokedex.getTypeNodes().status === 'SUCCESS' &&
                 resultPokedex.getPokemonData().status === 'SUCCESS') ?
                 m(
                     PageWithData,
                     {
                         pokemonTypeDict: resultPokedex.getTypeNodes().value,
                         pokemonDataDict: resultPokedex.getPokemonData().value,
                     },
        ) : null,
    }
});
