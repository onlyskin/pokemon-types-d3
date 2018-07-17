import * as m from 'mithril';
import * as d3 from 'd3';
import { PokemonType, INode } from './type_to_nodes';
import { updateVisualisation } from './update_visualisation';
import { focusedType, hoveredNode, visualisationTitle } from './utils';
import { forceSimulation } from './simulation';

const Visualisation: m.Component<{
    focused: PokemonType,
    title: string,
    forceSimulation: (height: number, width: number) => d3.Simulation<INode, undefined>,
}, {}> = {
    oncreate: ({attrs: {focused, title, forceSimulation}, dom}) => {
        updateVisualisation(dom, focused, title, forceSimulation);
    },
    onupdate: ({attrs: {focused, title, forceSimulation}, dom}) => {
        updateVisualisation(dom, focused, title, forceSimulation)
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
