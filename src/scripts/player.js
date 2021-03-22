import { screenToMapCoords } from "./helpers";
import controls from "./controls";
import { mapElements } from "./index";

class Player {
  constructor() {
    this.x = 5000;
    this.y = 5000;
    this.destination = null;
    this.facing = 0;
    this.facingTarget = null;
    this.radius = 20;
    this.target = null;
    this.wcStart = null;
    this.logs = 0;
  }

  woodcut() {
    this.target.logs--;
    this.logs++;

    if (!this.target.logs) {
      this.target.dead = true;
      this.target = null;
      this.wcStart = null;
    } else {
      this.wcStart = Date.now();
    }
  }

  setDestination(isClick) {
    this.target = null;
    const mapCoords = screenToMapCoords(controls.mouseX, controls.mouseY);
    const playerCoords = { x: this.x, y: this.y };

    let nearestIntersect = null;

    mapElements
      .filter((el) => !el.dead)
      .forEach((el) => {
        el.playerBoundsSegments.forEach((segment) => {
          const is = lineIntersection(
            playerCoords,
            mapCoords,
            segment.start,
            segment.end
          );

          if (is) {
            if (!nearestIntersect || is.dist < nearestIntersect.dist) {
              nearestIntersect = is;
            }
          }
        });
      });

    if (nearestIntersect) {
      mapCoords.x = nearestIntersect.x;
      mapCoords.y = nearestIntersect.y;
    }

    const delta_x = mapCoords.x - this.x;
    const delta_y = mapCoords.y - this.y;
    const theta_radians = Math.atan2(delta_y, delta_x);

    this.facingTarget = theta_radians;

    this.destination = {
      x: mapCoords.x,
      y: mapCoords.y,
      time: isClick ? Date.now() : this.destination && this.destination.time,
    };
  }

  setTarget(target) {
    if (!target || target.dead) {
      this.target = null;
      this.setDestination();
      return;
    }
    const distance = Math.hypot(
      target.x + target.width / 2 - this.x,
      target.y + target.height / 2 - this.y
    );
    if (distance < target.width + this.radius) {
      const mapCoords = screenToMapCoords(controls.mouseX, controls.mouseY);

      const delta_x = mapCoords.x - this.x;
      const delta_y = mapCoords.y - this.y;
      const theta_radians = Math.atan2(delta_y, delta_x);

      this.facingTarget = theta_radians;

      this.lastAction = Date.now();
      this.target = target;
      player.wcStart = Date.now();
    } else {
      this.setDestination();
    }
  }
}

const player = new Player();

export default player;

function lineIntersection(pointA, pointB, pointC, pointD) {
  var z1 = pointA.x - pointB.x;
  var z2 = pointC.x - pointD.x;
  var z3 = pointA.y - pointB.y;
  var z4 = pointC.y - pointD.y;
  var dist = z1 * z4 - z3 * z2;
  if (dist == 0) {
    return null;
  }
  var tempA = pointA.x * pointB.y - pointA.y * pointB.x;
  var tempB = pointC.x * pointD.y - pointC.y * pointD.x;
  var xCoor = (tempA * z2 - z1 * tempB) / dist;
  var yCoor = (tempA * z4 - z3 * tempB) / dist;

  if (
    xCoor < Math.min(pointA.x, pointB.x) ||
    xCoor > Math.max(pointA.x, pointB.x) ||
    xCoor < Math.min(pointC.x, pointD.x) ||
    xCoor > Math.max(pointC.x, pointD.x)
  ) {
    return null;
  }
  if (
    yCoor < Math.min(pointA.y, pointB.y) ||
    yCoor > Math.max(pointA.y, pointB.y) ||
    yCoor < Math.min(pointC.y, pointD.y) ||
    yCoor > Math.max(pointC.y, pointD.y)
  ) {
    return null;
  }

  const distance = Math.hypot(pointA.x - xCoor, pointA.y - yCoor);

  return {
    x: xCoor,
    y: yCoor,
    dist: distance,
  };
}
