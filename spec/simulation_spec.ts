import * as windowMock from 'mithril/test-utils/browserMock';
(global as any).window = windowMock();
(global as any).document = window.document;
import * as o from 'ospec';
import { nodeRadius, INode } from '../src/simulation';

o.spec('calculate node radius', () => {
    o('returns scaled svg bounding width times 0.5', () => {
        const node = {
            name: 'fire',
            multiplier: 0.5,
            direction: 'to',
        } as INode;

        const svgStub = o.spy();
        svgStub.getBoundingClientRect = () => ({width: 100} as DOMRect);

        const radius = nodeRadius(node, svgStub);

        o(radius).equals(1.5);
    });

    o('returns scaled svg bounding width times 2', () => {
        const node = {
            name: 'fire',
            multiplier: 2,
            direction: 'to',
        } as INode;

        const svgStub = o.spy();
        svgStub.getBoundingClientRect = () => ({width: 100} as DOMRect);

        const radius = nodeRadius(node, svgStub);

        o(radius).equals(6);
    });

    o('returns scaled svg bounding width times 1', () => {
        const node = {
            name: 'fire',
            multiplier: 0,
            direction: 'to',
        } as INode;

        const svgStub = o.spy();
        svgStub.getBoundingClientRect = () => ({width: 100} as DOMRect);

        const radius = nodeRadius(node, svgStub);

        o(radius).equals(0.3);
    });
});
