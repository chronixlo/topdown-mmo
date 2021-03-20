import player from "./player";
import controls from "./controls";
import { screenToMapCoords, mapToScreenCoords, rand } from "./helpers";
import { MOVEMENT_SPEED, TURN_SPEED } from "./consts";

import "../styles/index.scss";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const viewWidth = window.innerWidth;
const viewHeight = window.innerHeight;

export const mapSize = 1000;

export const halfWidth = viewWidth / 2;
export const halfHeight = viewHeight / 2;

canvas.width = viewWidth;
canvas.height = viewHeight;

export const mapElements = new Array(10).fill().map(() => ({
  x: rand(0, viewWidth),
  y: rand(0, viewHeight),
  height: rand(60, 100),
  width: rand(60, 100),
}));

function updatePointerPosition(e) {
  controls.mouseX = e.offsetX;
  controls.mouseY = e.offsetY;
}

const pointerUp = (e) => {
  if (e.which === 1) {
    controls.mouse1 = false;
  }
  if (e.which === 3) {
    controls.mouse2 = false;
  }
};

canvas.addEventListener("mousemove", updatePointerPosition);

canvas.addEventListener("mousedown", (e) => {
  if (e.which === 1) {
    controls.mouse1 = true;
  }
  if (e.which === 3) {
    controls.mouse2 = true;
    player.setDestination(true);
  }
});

document.addEventListener("mouseup", pointerUp);

canvas.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});

function keyPress(e) {}

document.addEventListener("keypress", keyPress);

let lastFrameTime = Date.now();

// draw

function loop() {
  const time = Date.now();
  const frameTime = time - lastFrameTime;

  ctx.clearRect(0, 0, viewWidth, viewHeight);

  if (controls.mouse2) {
    player.setDestination();
  }

  if (player.destination) {
    const distance = Math.hypot(
      player.x - player.destination.x,
      player.y - player.destination.y
    );

    if (distance > 2) {
      const p = (MOVEMENT_SPEED * (frameTime / 1000)) / distance;

      const x = player.x + p * (player.destination.x - player.x);
      const y = player.y + p * (player.destination.y - player.y);

      player.x = x;
      player.y = y;
    } else {
      player.x = player.destination.x;
      player.y = player.destination.y;
      player.destination = null;
    }
  }

  // turning
  // todo: optimize
  if (player.facingTarget) {
    let turnDistance = Math.abs(player.facingTarget - player.facing);
    let ccw = false;

    if (turnDistance > Math.PI) {
      turnDistance = Math.PI * 2 - turnDistance;
      ccw = true;
    }

    const p = (TURN_SPEED * (frameTime / 1000)) / turnDistance;

    if (ccw) {
      // todo: fix perpetual rotation
      if (player.facingTarget - player.facing < 0) {
        player.facing =
          player.facing +
          p * (Math.PI * 2 - Math.abs(player.facingTarget - player.facing));
      } else {
        player.facing =
          player.facing -
          p * (Math.PI * 2 - Math.abs(player.facingTarget - player.facing));
      }
    } else {
      player.facing = player.facing + p * (player.facingTarget - player.facing);
    }

    if (turnDistance < 0.1 && turnDistance > -0.1) {
      player.facing = player.facingTarget;
      player.facingTarget = null;
    }
  }

  // play area
  const playAreaScreenCoords = mapToScreenCoords(mapSize, mapSize);
  ctx.fillStyle = "#ccc";
  ctx.fillRect(
    Math.max(0, halfWidth - player.x),
    Math.max(0, halfHeight - player.y),
    Math.min(viewWidth, playAreaScreenCoords.x),
    Math.min(viewHeight, playAreaScreenCoords.y)
  );

  // map elements
  ctx.fillStyle = "#222";
  mapElements.forEach((el) => {
    const elCoords = mapToScreenCoords(el.x, el.y);
    ctx.fillRect(elCoords.x, elCoords.y, el.width, el.height);
  });

  // destination target marker
  if (player.destination) {
    const destinationScreenCoords = mapToScreenCoords(
      player.destination.x,
      player.destination.y
    );
    const delta = time - player.destination.time;
    const radius = Math.max(20 - delta / 10, 5);
    ctx.beginPath();
    ctx.strokeStyle = "#f00";
    ctx.lineWidth = 1;
    ctx.arc(
      destinationScreenCoords.x,
      destinationScreenCoords.y,
      radius,
      0,
      Math.PI * 2
    );
    ctx.closePath();
    ctx.stroke();
  }

  // player
  ctx.beginPath();
  ctx.fillStyle = "#666";
  ctx.strokeStyle = "#222";
  ctx.lineWidth = 5;
  ctx.arc(halfWidth, halfHeight, 15, 0, Math.PI * 2);
  ctx.closePath();
  ctx.stroke();
  ctx.fill();

  const x = halfWidth + 10 * Math.cos(player.facing);
  const y = halfHeight + 10 * Math.sin(player.facing);

  // facing dot
  ctx.beginPath();
  ctx.fillStyle = "#a34";
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();

  // out of bounds
  // todo: optimize
  ctx.fillStyle = "#222";
  // left
  if (halfWidth - player.x > 0) {
    ctx.fillRect(0, 0, halfWidth - player.x, viewHeight);
  }
  // top
  if (halfHeight - player.y > 0) {
    ctx.fillRect(0, 0, viewWidth, halfHeight - player.y);
  }
  // right
  if (playAreaScreenCoords.x < viewWidth) {
    ctx.fillRect(
      playAreaScreenCoords.x,
      0,
      viewWidth - playAreaScreenCoords.x,
      viewHeight
    );
  }
  // bottom
  if (playAreaScreenCoords.y < viewHeight) {
    ctx.fillRect(
      0,
      playAreaScreenCoords.y,
      viewWidth,
      viewHeight - playAreaScreenCoords.y
    );
  }

  lastFrameTime = time;

  requestAnimationFrame(loop);
}

loop();
