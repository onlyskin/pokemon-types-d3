import * as m from 'mithril';
import * as d3 from 'd3';
import { PokemonType, INode } from './type_to_nodes';
import { updateVisualisation } from './update_visualisation';
import { focusedType, hoveredNode, visualisationTitle } from './utils';
import { forceSimulation } from './simulation';

const Visualisation: m.Component<{
    focused: PokemonType,
    title: string,
    forceSimulation: (svg: Element) => d3.Simulation<INode, undefined>,
}, {
    oldFocused: PokemonType,
}> = {
    oncreate: ({attrs: {focused, title, forceSimulation}, dom}) => {
        updateVisualisation(dom, focused, title, forceSimulation, true);
        this.oldFocused = focused;
    },
    onupdate: ({attrs: {focused, title, forceSimulation}, dom}) => {
        const focusedUpdated = focused !== this.oldFocused;
        updateVisualisation(dom, focused, title, forceSimulation, focusedUpdated);
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

m.mount(document.body, {
    view: () => {
        return m(Visualisation, {
            focused: focusedType(),
            title: visualisationTitle(hoveredNode(), focusedType()),
            forceSimulation,
        });
    }
});
