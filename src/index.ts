import * as m from 'mithril';
import * as d3 from 'd3';
import { PokemonType, INode } from './type_to_nodes';
import { updateVisualisation } from './update_visualisation';
import { focusedType } from './utils';
import { forceSimulation } from './simulation';

const Visualisation: m.Component<{
    focused: PokemonType,
    forceSimulation: (height: number, width: number) => d3.Simulation<INode, undefined>,
}, {}> = {
    oncreate: ({attrs: {focused, forceSimulation}, dom}) => {
        updateVisualisation(dom, focused, forceSimulation);
    },
    onupdate: ({attrs: {focused, forceSimulation}, dom}) => {
        updateVisualisation(dom, focused, forceSimulation)
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

m.mount(document.body, {
    view: () => {
        return m(Visualisation, {
            focused: focusedType(),
            forceSimulation,
        });
    }
});
