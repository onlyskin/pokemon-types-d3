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
    pokemonName: string;
    firstType: string;
    secondType: string;
    generation: number;

    constructor(pokemonTypeDict, pokemonDataDict) {
        this.generation = 0;
        this.pokemonTypeDict = pokemonTypeDict;
        this.pokemonDataDict = pokemonDataDict;

        this.activeTransition = false;
        this.hoveredNode = undefined;

        this.pokemonName = 'bulbasaur';
        this.firstType = 'grass';
        this.secondType = 'poison';

        this.trySyncFromRoute();
    }

    trySyncFromRoute() {
        const pokemonName = m.route.param('p') || '';
        const firstType = m.route.param('f') || '';
        const secondType = m.route.param('s') || '';

        if (pokemonName !== '') {
            this.setPokemonName(pokemonName);
        } else if (firstType !== '' && secondType !== '') {
            this.setFirstType(firstType);
            this.setSecondType(secondType);
        } else if (firstType !== '') {
            this.setFirstType(firstType);
            this.setSecondType('');
        }

        this.syncState();
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

    syncState() {
        this.generation++;

        const newParams = {};
        if (this.pokemonName !== '') {
            newParams['p'] = this.pokemonName;
        }
        if (this.firstType !== '') {
            newParams['f'] = this.firstType;
        }
        if (this.secondType !== '') {
            newParams['s'] = this.secondType;
        }

        m.route.set('/', newParams);
    }

    setPokemonName(name: string) {
        const pokemon = this.pokemonDataDict[name];

        if (pokemon === undefined) {
            return;
        }

        this.pokemonName = name;
        this.firstType = pokemon.types[0];
        this.secondType = pokemon.types[1] === undefined ? '' : pokemon.types[1];
        this.syncState();
    }

    setFirstType(type: string) {
        // first type can never be unset
        if (type !== '' && this.pokemonTypeDict[type] !== undefined) {
            this.firstType = type;
            this.pokemonName = '';
            this.syncState();
        }
    }

    setSecondType(type: string) {
        if (type === '') {
            this.secondType = '';
            this.pokemonName = '';
            this.syncState();
        } else if (this.pokemonTypeDict[type] !== undefined) {
            this.secondType = type;
            this.pokemonName = '';
            this.syncState();
        }
    }
};

function visualisationTitle(state: IState): string {
    const hovered = state.hoveredNode;
    const firstType = state.firstType;
    const secondType = state.secondType;

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

    const { multiplier } = hovered;
    const multiplierText = multiplier === 0.5 ? '½' : multiplier === 0.25 ? '¼' : multiplier;

    return `${attacking} gets ${multiplierText}x against ${defending}`;
}

interface VisualisationAttrs {
    simulation: d3.Simulation<INode, undefined>;
    state: IState;
    pokemonTypeDict: PokemonTypeDict;
    pokemonDataDict: PokemonDataDict;
}

const Visualisation: m.ClosureComponent<VisualisationAttrs> = function({attrs: {state}}) {
    let oldFirst: PokemonType = state.firstType;
    let oldSecond: PokemonType = state.secondType;

    function domComputations(state: IState, dom: Element, pokemonDataDict: PokemonDataDict) {
        updateFocusedText(state, dom, pokemonDataDict);
        updateTitle(state, dom);
    }

    function updateFocusedText(state: IState, dom: Element, pokemonDataDict: PokemonDataDict) {
        const {height, width} = boundingDimensions(dom);
        const position = Math.min(height, width);
        const el = dom.querySelector('#focused-text');
        el.setAttribute('x', (position * 0.5).toString());
        el.setAttribute('y', (position * 0.5).toString());
        el.textContent = `${state.firstType}${state.secondType ? '+' : ''}${state.secondType}`;
    }

    function updateTitle(state: IState, dom: Element) {
        const {height, width} = boundingDimensions(dom);
        const el = dom.querySelector('#title-text');
        el.setAttribute('x', (width * 0.5).toString());
        el.setAttribute('y', (height * 0.125).toString());
        el.textContent = visualisationTitle(state);
    }

    function getNodes(pokemonTypeDict, state) {
        const first = state.firstType;
        const second = state.secondType;

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
            const newFirst = state.firstType;
            const newSecond = state.secondType;
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
                width: 300,
                height: 300,
                version: '1',
                xmlns: 'http://www.w3.org/2000/svg',
            },
            m('text#title-text.open-sans.f5', {}, ''),
            m('text#focused-text.open-sans.f3.small-caps', {}, ''),
        ),
    }
};

const PokemonSvg = {
    oncreate: function({attrs: {simulation, pokemonTypeDict, pokemon}, dom}) {
        const nodes = nodesForTypes(pokemonTypeDict, pokemon.types);
        const state = {
            setActiveTransition: () => null,
            setFirstType: () => null,
            setSecondType: () => null,
            setHoveredNode: () => null,
        };
        updateVisualisation(dom, simulation, state, nodes);
    },
    view: ({attrs: {pokemon}}) => [
        m(
            'svg',
            {
                width: 300,
                height: 300,
                version: '1',
                xmlns: 'http://www.w3.org/2000/svg',
            },
        ),
    ],
}

const PokemonVisualisation = {
    view: ({attrs}) => m('.ma2.shadow-4.flex.items-stretch.justify-center.ba.b--near-white.bg-white.br3.pa2.open-sans', [
        m(PokemonSvg, attrs),
        m(
            '.flex.flex-column.justify-around.items-end',
            m('.small-caps.f3', attrs.pokemon.name),
            m(Sprite, {pokemonData: attrs.pokemon, target_size: 110, state: {pokemonName: ''}}),
            m('.small-caps.f3', attrs.pokemon.types.join(' ')),
        )
    ]),
};

window.addEventListener('resize', () => {
    m.redraw();
});

const simulation = forceSimulation();
const generations = {1: 151, 2: 251, 3: 386, 4: 493, 5: 649, 6:721, 7: 809, 8: 905, 9: 1025}
const resultPokedex = new ResultPokedex(generations[3], true);

const Sprite = {
    view: ({ attrs: { pokemonData: { index, name, animated_artwork, official_artwork}, state, target_size = 60 } }) => {
        const artwork_url = official_artwork;
        const isFocused = state.pokemonName === name;

        return m(
            `a.black.no-underline.ba.br-pill${isFocused ? '.b--light-green.bg-washed-green' : '.b--light-gray.bg-near-white'}.pa2.ma2.shadow-4`,
            {href: `https://bulbapedia.bulbagarden.net/wiki/${name}_(Pok%C3%A9mon)`},
            m(
                '.flex.justify-center.items-center.small-caps.f7.tc',
                {
                    'key': name,
                    'title': name,
                    'style': {
                        'height': target_size,
                        'width': target_size,
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

const SearchInput = {
    oncreate({ attrs, dom }) {
        if (attrs.forceValue) {
            dom.value = attrs.forceValue;
        }
        this.generation = attrs.generation;
    },
    onupdate({ attrs, dom }) {
        if (this.generation !== attrs.generation) {
            dom.value = attrs.forceValue;
            this.generation = attrs.generation;
        }
    },
    view({ attrs: {state, dataListName, onsearch, onchange} }) {
        return m(
            'input.ma1.pa1.br3.small-caps',
            {
                'type': 'search',
                'list': dataListName,
                onsearch,
                onchange,
            },
        );
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
                m('',
                    m(SearchInput, {
                        state,
                        forceValue: state.pokemonName,
                        generation: state.generation,
                        dataListName: 'pokemon-list',
                        onsearch: e => {
                            state.setPokemonName(e.srcElement.value);
                        },
                        onchange: e => {
                            state.setPokemonName(e.srcElement.value);
                        },
                    }),
                ),
                m(SearchInput, {
                    state,
                    forceValue: state.firstType,
                    generation: state.generation,
                    dataListName: 'types-list',
                    onsearch: e => {
                        state.setFirstType(e.srcElement.value);
                    },
                }),
                m(SearchInput, {
                    state,
                    forceValue: state.secondType,
                    generation: state.generation,
                    dataListName: 'types-list',
                    onsearch: e => {
                        state.setSecondType(e.srcElement.value);
                    },
                }),
                m(
                    'datalist#pokemon-list',
                    Object.keys(pokemonDataDict).map(name => m('option.small-caps', {value: name}))
                ),
                m(
                    'datalist#types-list',
                    Object.keys(pokemonTypeDict).map(type => m('option.small-caps', {value: type}))
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
    const first = state.firstType;
    const second = state.secondType;
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
    let previousParams = {};

    return {
        oninit: () => {
            state = new State(pokemonTypeDict, pokemonDataDict);
        },
        onupdate: () => {
            if (JSON.stringify(m.route.param()) !== JSON.stringify(previousParams)) {
                state.trySyncFromRoute();
                previousParams = m.route.param();
            }
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
            m('.flex.flex-wrap.items-stretch',
              Object.values(pokemonDataDict).map(pokemon => m(
                  PokemonVisualisation,
                  {
                      simulation,
                      pokemonTypeDict: resultPokedex.getTypeNodes().value,
                      pokemon,
                  }
              ))
             ),
        ]
    };
}

const LoadingPage = {
    view: () => m('.flex.h-100.items-center.open-sans.f3', 'Loading'),
};

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
        ) : m(LoadingPage),
    },
});
