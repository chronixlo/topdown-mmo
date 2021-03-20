import { screenToMapCoords } from "./helpers";
import controls from "./controls";
import { mapElements } from "./index";

class Player {
  constructor() {
    this.x = 750;
    this.y = 750;
    this.destination = null;
    this.facing = 0;
    this.facingTarget = null;
  }

  setDestination(isClick) {
    this.skill = null;

    const mapCoords = screenToMapCoords(controls.mouseX, controls.mouseY);

    const targetElement = mapElements.find((el) => {
      return (
        mapCoords.x > el.x &&
        mapCoords.x < el.x + el.width &&
        mapCoords.y > el.y &&
        mapCoords.y < el.y + el.height
      );
    });

    if (targetElement) {
      const xOffset =
        (mapCoords.x - targetElement.x) / targetElement.width - 0.5;
      const yOffset =
        (mapCoords.y - targetElement.y) / targetElement.height - 0.5;

      const xNearer = Math.abs(xOffset) > Math.abs(yOffset);

      if (xNearer) {
        if (xOffset < 0) {
          mapCoords.x = targetElement.x;
        } else {
          mapCoords.x = targetElement.x + targetElement.width;
        }
      } else {
        if (yOffset < 0) {
          mapCoords.y = targetElement.y;
        } else {
          mapCoords.y = targetElement.y + targetElement.height;
        }
      }
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
}

export default new Player();
