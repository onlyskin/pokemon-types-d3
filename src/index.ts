import m from 'mithril';
import stream from 'mithril/stream';
import * as d3 from 'd3';
import { PokemonType, INode } from './type_to_nodes';
import { updateVisualisation } from './update_visualisation';
import { boundingDimensions, IState } from './utils';
import { forceSimulation } from './simulation';
import { ResultPokedex, PokemonTypeDict } from './pokedex';

const state: IState = {
    activeTransition: false,
    setActiveTransition: function(is_active: boolean) {
        this.activeTransition = is_active;
    },
    focusedType: stream<PokemonType>('fire'),
    hoveredNode: stream<INode | undefined>(undefined),
    setFocusedType: function(newType: PokemonType) {
        if (newType === this.focusedType()) {
            return;
        }
    
        this.focusedType(newType);
        m.redraw();
    },
    setHoveredNode: function(newNode?: INode) {
        if (newNode === this.hoveredNode() || this.activeTransition) {
            return;
        }
    
        this.hoveredNode(newNode);
        m.redraw();
    }
};

function visualisationTitle(state: IState): string {
    const hovered = state.hoveredNode();
    const focused = state.focusedType();

    if (hovered === undefined) {
        return '';
    }

    let attacking;
    let defending;

    if (hovered.direction === 'from') {
        attacking = hovered.name;
        defending = focused;
    } else {
        attacking = focused;
        defending = hovered.name;
    }

    return `${attacking} gets ${hovered.multiplier}x against ${defending}`;
}

interface VisualisationAttrs {
    simulation: d3.Simulation<INode, undefined>;
    state: IState;
    pokemonTypeDict: PokemonTypeDict;
}

const Visualisation: m.ClosureComponent<VisualisationAttrs> = function({attrs: {state}}) {
    let oldFocused: PokemonType = state.focusedType();

    function domComputations(state: IState, dom: Element) {
        updateFocusedText(state, dom);
        updateTitle(state, dom);
    }

    function updateFocusedText(state: IState, dom: Element) {
        const {height, width} = boundingDimensions(dom);
        const el = dom.querySelector('#focused-text');
        el.setAttribute('x', (width * 0.5).toString());
        el.setAttribute('y', (height * 0.5).toString());
        el.textContent = state.focusedType();
    }

    function updateTitle(state: IState, dom: Element) {
        const {height, width} = boundingDimensions(dom);
        const el = dom.querySelector('#title-text');
        el.setAttribute('x', (width * 0.5).toString());
        el.setAttribute('y', (height * 0.125).toString());
        el.textContent = visualisationTitle(state);
    }

    return {
        oncreate: function({attrs: {simulation, state, pokemonTypeDict}, dom}) {
            updateVisualisation(dom, simulation, state, pokemonTypeDict);
            domComputations(state, dom);
        },
        onupdate: function({attrs: {simulation, state, pokemonTypeDict}, dom}) {
            const focusedUpdated = state.focusedType() !== oldFocused;
            if (focusedUpdated) {
                updateVisualisation(dom, simulation, state, pokemonTypeDict);
            }

            oldFocused = state.focusedType();
            domComputations(state, dom);
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

m.mount(document.body, {
    view: () => {
        return resultPokedex.getTypeNodes().status === 'SUCCESS' ?
            m(Visualisation, {state, simulation, pokemonTypeDict: resultPokedex.getTypeNodes().value}) :
            null;
    }
});
