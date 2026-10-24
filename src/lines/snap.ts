// endpoints snap to the middle of a side, like Excalidraw's binding
import { setEdgePoint, set_setEdgePoint } from '../core/core';
import { isLife } from '../diagrams/catalog';

export var ux2SetEdgePoint0: (e: any, start: any, p: any, node: any) => void;

export function install(): void {
  ux2SetEdgePoint0 = setEdgePoint;
  set_setEdgePoint(function (e, start, p, node) {
    ux2SetEdgePoint0(e, start, p, node);
    var k = start ? 'fromAnchor' : 'toAnchor',
      a = e[k];
    if (!a || !node || isLife(node)) return;
    var onX = a.x <= 0.02 || a.x >= 0.98,
      onY = a.y <= 0.02 || a.y >= 0.98;
    if (onX && Math.abs(a.y - 0.5) < 0.16) a.y = 0.5;
    if (onY && Math.abs(a.x - 0.5) < 0.16) a.x = 0.5;
  });
}
