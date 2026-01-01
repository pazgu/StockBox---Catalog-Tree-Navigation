import { Point } from "../../../../../types/types";


const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

export function getBaseCoverScale(imgW: number, imgH: number, box: number): number {
  return Math.max(box / imgW, box / imgH);
}

export function clampOffsetToCircle(
  offset: Point,
  imgW: number,
  imgH: number,
  zoom: number,
  box: number
): Point {
  const base = getBaseCoverScale(imgW, imgH, box);
  const dispW = imgW * base * zoom;
  const dispH = imgH * base * zoom;

  const halfW = dispW / 2;
  const halfH = dispH / 2;
  const radius = box / 2;

  const maxX = Math.max(0, halfW - radius);
  const maxY = Math.max(0, halfH - radius);

  return {
    x: clamp(offset.x, -maxX, maxX),
    y: clamp(offset.y, -maxY, maxY),
  };
}

export function anchoredZoom(
  oldZoom: number,
  newZoom: number,
  offset: Point,
  cursorInBox: Point,
  imgW: number,
  imgH: number,
  box: number
): Point {
  const u = cursorInBox.x - box / 2;
  const v = cursorInBox.y - box / 2;

  const newOffsetX = u - (newZoom / oldZoom) * (u - offset.x);
  const newOffsetY = v - (newZoom / oldZoom) * (v - offset.y);

  return clampOffsetToCircle({ x: newOffsetX, y: newOffsetY }, imgW, imgH, newZoom, box);
}
