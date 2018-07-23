import * as m from 'mithril';
import { INode } from './simulation';
import { updateVisualisation } from './update_visualisation';

export const Visualisation: m.Component<{
    focused: string,
    title: string,
    forceSimulation: (svg: Element) => d3.Simulation<INode, undefined>,
}, {
    oldFocused: string,
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
