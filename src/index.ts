import m from 'mithril';
import stream from 'mithril/stream';
import * as d3 from 'd3';
import { PokemonType, INode } from './type_to_nodes';
import { updateVisualisation } from './update_visualisation';
import { boundingDimensions, IState } from './utils';
import { forceSimulation } from './simulation';

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

const Visualisation: m.Component<{
    simulation: d3.Simulation<INode, undefined>,
    state: IState,
}, {
    oldFocused: PokemonType,
}> = {
    oncreate: function({attrs: {simulation, state}, dom}) {
        updateVisualisation(dom, simulation, true, state);
        this.oldFocused = state.focusedType();
        this.domComputations(state, dom);
    },
    onupdate: function({attrs: {simulation, state}, dom}) {
        const focusedUpdated = state.focusedType() !== this.oldFocused;
        updateVisualisation(dom, simulation, focusedUpdated, state);
        this.oldFocused = state.focusedType();
        this.domComputations(state, dom);
    },
    domComputations: function(state: IState, dom: Element) {
        this.updateFocusedText(state, dom);
        this.updateTitle(state, dom);
    },
    updateFocusedText: function(state: IState, dom: Element) {
        const {height, width} = boundingDimensions(dom);
        const el = dom.querySelector('#focused-text');
        el.setAttribute('x', (width * 0.5).toString());
        el.setAttribute('y', (height * 0.5).toString());
        el.textContent = state.focusedType();
    },
    updateTitle: function(state: IState, dom: Element) {
        const {height, width} = boundingDimensions(dom);
        const el = dom.querySelector('#title-text');
        el.setAttribute('x', (width * 0.5).toString());
        el.setAttribute('y', (height * 0.125).toString());
        el.textContent = visualisationTitle(state);
    },
    view: () => {
        return m(
            'svg',
            {
                version: '1',
                xmlns: 'http://www.w3.org/2000/svg',
            },
            m('text#focused-text', {}, 'bug'),
            m('text#title-text', {}, 'bug'),
        );
    },
};

window.addEventListener('resize', () => {
    m.redraw();
});

const simulation = forceSimulation();

m.mount(document.body, {
    view: () => {
        return m(Visualisation, {
            state,
            simulation,
        });
    }
});
