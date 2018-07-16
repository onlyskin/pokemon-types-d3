import * as m from 'mithril';
import * as d3 from 'd3';
import { PokemonType, INode } from './type_to_nodes';
import { updateVisualisation } from './update_visualisation';
import { focusedType, HEIGHT, SVG_WIDTH, nodeRadius } from './utils';

const Visualisation: m.Component<{
    focused: PokemonType,
    simulation: d3.Simulation<INode, undefined>,
}, {}> = {
    oncreate: ({attrs: {focused, simulation}, dom}) => {
        updateVisualisation(dom, focused, simulation);
    },
    onupdate: ({attrs: {focused, simulation}, dom}) => {
        updateVisualisation(dom, focused, simulation)
    },
    view: ({attrs: {focused}}) => {
        return m(
            'svg',
            {
                version: '1',
                xmlns: 'http://www.w3.org/2000/svg',
                height: HEIGHT,
                width: SVG_WIDTH(),
            },
        );
    },
};

const simulation = d3.forceSimulation<INode>()
    .force("collision", d3.forceCollide<INode>(d => nodeRadius(d) + 1))
    .force("x", d3.forceX<INode>(d => {
        return d.direction === 'from' ? SVG_WIDTH() / 4 : 3 * SVG_WIDTH() / 4;
    }))
    .force("y", d3.forceY(HEIGHT / 2))
    .stop();

m.mount(document.body, {
    view: () => {
        return m(Visualisation, {
            focused: focusedType(),
            simulation,
        });
    }
});
