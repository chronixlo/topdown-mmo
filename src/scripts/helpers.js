import player from "./player";
import { halfWidth, halfHeight, mapSize } from "./index";

export function screenToMapCoords(_x, _y) {
  let x = _x + player.x - halfWidth;
  let y = _y + player.y - halfHeight;

  // fit to map
  if (x < 0) {
    x = 0;
  } else if (x > mapSize) {
    x = mapSize;
  }

  if (y < 0) {
    y = 0;
  } else if (y > mapSize) {
    y = mapSize;
  }

  return { x, y };
}

export function mapToScreenCoords(_x, _y) {
  const x = _x - player.x + halfWidth;
  const y = _y - player.y + halfHeight;

  return { x, y };
}

export function rand(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
