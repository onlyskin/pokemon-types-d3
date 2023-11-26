import m from 'mithril';
import stream from 'mithril/stream';
import * as d3 from 'd3';
import { PokemonType, INode } from './type_to_nodes';
import { updateVisualisation } from './update_visualisation';
import { IState } from './utils';
import { forceSimulation } from './simulation';

const state: IState = {
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
        if (newNode === this.hoveredNode()) {
            return;
        }
    
        this.hoveredNode(newNode);
        m.redraw();
    }
};

const Visualisation: m.Component<{
    simulation: d3.Simulation<INode, undefined>,
    state: IState,
}, {
    oldFocused: PokemonType,
}> = {
    oncreate: function({attrs: {simulation, state}, dom}) {
        updateVisualisation(dom, simulation, true, state);
        this.oldFocused = state.focusedType();
    },
    onupdate: function({attrs: {simulation, state}, dom}) {
        const focusedUpdated = state.focusedType() !== this.oldFocused;
        updateVisualisation(dom, simulation, focusedUpdated, state);
        this.oldFocused = state.focusedType();
    },
    view: () => {
        return m(
            'svg',
            {
                version: '1',
                xmlns: 'http://www.w3.org/2000/svg',
            },
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
