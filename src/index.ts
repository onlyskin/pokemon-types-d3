import m from 'mithril';
import * as d3 from 'd3';
import { PokemonType, INode } from './type_to_nodes';
import { updateVisualisation } from './update_visualisation';
import { focusedType, hoveredNode, visualisationTitle } from './utils';
import { forceSimulation } from './simulation';

const Visualisation: m.Component<{
    focused: PokemonType,
    title: string,
    simulation: d3.Simulation<INode, undefined>,
}, {
    oldFocused: PokemonType,
}> = {
    oncreate: ({attrs: {focused, title, simulation}, dom}) => {
        updateVisualisation(dom, focused, title, simulation, true);
        this.oldFocused = focused;
    },
    onupdate: ({attrs: {focused, title, simulation}, dom}) => {
        const focusedUpdated = focused !== this.oldFocused;
        updateVisualisation(dom, focused, title, simulation, focusedUpdated);
        this.oldFocused = focused;
    },
    view: ({attrs: {focused}}) => {
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
            focused: focusedType(),
            title: visualisationTitle(hoveredNode(), focusedType()),
            simulation,
        });
    }
});
