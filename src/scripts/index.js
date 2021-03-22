import player from "./player";
import controls from "./controls";
import { screenToMapCoords, mapToScreenCoords, rand } from "./helpers";
import { MOVEMENT_SPEED, TURN_SPEED } from "./consts";

import axe from "../assets/axe.png";
import log from "../assets/log.png";
import ground from "../assets/ground.png";
import "../styles/index.scss";
import { generateTree } from "./Entities/Tree";
import { generateStone } from "./Entities/Stone";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const viewWidth = window.innerWidth;
const viewHeight = window.innerHeight;

export const mapSize = 10000;

export const halfWidth = viewWidth / 2;
export const halfHeight = viewHeight / 2;

const mapBounds = {
  x1: player.radius,
  x2: mapSize - player.radius,
  y1: player.radius,
  y2: mapSize - player.radius,
};

canvas.width = viewWidth;
canvas.height = viewHeight;

const axeImg = new Image();
axeImg.src = axe;

const groundImg = new Image();
groundImg.src = ground;

const logImg = new Image();
logImg.src = log;

const playerImg = new Image();
playerImg.src = `src/assets/survivor/knife/idle/survivor-idle_knife_0.png`;

const trees = new Array(1000).fill().map(generateTree);

const stones = new Array(1000).fill().map(generateStone);

export const mapElements = [...trees, ...stones];

function updatePointerPosition(e) {
  if (e.target.touches) {
    controls.mouseX = e.target.touches[0].clientX;
    controls.mouseY = e.target.touches[0].clientY;
  } else {
    controls.mouseX = e.clientX;
    controls.mouseY = e.clientY;
  }
}

const pointerUp = (e) => {
  controls.mouse1 = false;
};

const pointerDown = (e) => {
  controls.mouse1 = true;
};

canvas.addEventListener("mousemove", updatePointerPosition);
canvas.addEventListener("touchmove", updatePointerPosition);

canvas.addEventListener("mousedown", pointerDown);
canvas.addEventListener("touchstart", pointerDown);

document.addEventListener("mouseup", pointerUp);
document.addEventListener("touchup", pointerUp);

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

  if (controls.mouse1) {
    const mapCoords = screenToMapCoords(controls.mouseX, controls.mouseY);

    const tree = trees.find(
      (el) =>
        mapCoords.x >= el.playerBounds.x1 &&
        mapCoords.x <= el.playerBounds.x2 &&
        mapCoords.y >= el.playerBounds.y1 &&
        mapCoords.y <= el.playerBounds.y2
    );

    player.setTarget(tree);
  }

  if (player.target) {
    if (player.wcStart + 1000 < time) {
      player.woodcut();
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

    const toTurn = (TURN_SPEED * (frameTime / 1000)) / turnDistance;

    const p = Math.min(toTurn, turnDistance);

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

  // if (!player.facingTarget && player.destination) {
  if (player.destination != null) {
    const distance = Math.hypot(
      player.x - player.destination.x,
      player.y - player.destination.y
    );

    const toMove = (MOVEMENT_SPEED * (frameTime / 1000)) / distance;

    let x, y;

    if (toMove < distance) {
      const px = toMove * (player.destination.x - player.x);
      const py = toMove * (player.destination.y - player.y);

      x = player.x + px;
      y = player.y + py;
    } else {
      x = player.destination.x;
      y = player.destination.y;
      player.destination = null;
    }

    let collision = false;

    // check collisions for new position
    mapElements
      .filter((el) => !el.dead)
      .forEach((el) => {
        if (
          x >= el.playerBounds.x1 &&
          x <= el.playerBounds.x2 &&
          y >= el.playerBounds.y1 &&
          y <= el.playerBounds.y2
        ) {
          collision = true;
        }
      });

    if (
      x <= mapBounds.x1 ||
      x >= mapBounds.x2 ||
      y <= mapBounds.y1 ||
      y >= mapBounds.y2
    ) {
      collision = true;
    }

    if (!collision) {
      player.x = x;
      player.y = y;
    } else {
      player.destination = null;
    }
  }

  // play area
  const playAreaScreenCoords = mapToScreenCoords(mapSize, mapSize);
  ctx.fillStyle = "#544321";
  ctx.fillRect(
    Math.max(0, halfWidth - player.x),
    Math.max(0, halfHeight - player.y),
    Math.min(viewWidth, playAreaScreenCoords.x),
    Math.min(viewHeight, playAreaScreenCoords.y)
  );

  const tileSize = 96;

  for (let x = 0; x < viewWidth / tileSize + 1; x++) {
    for (let y = 0; y < viewHeight / tileSize + 1; y++) {
      ctx.drawImage(
        groundImg,
        x * tileSize - (player.x % tileSize),
        y * tileSize - (player.y % tileSize),
        tileSize,
        tileSize
      );
    }
  }

  ctx.fillStyle = "rgba(80, 57, 23, 0.8)";
  mapElements.forEach((el) => {
    const elCoords = mapToScreenCoords(el.playerBounds.x1, el.playerBounds.y1);
    ctx.fillRect(elCoords.x, elCoords.y, el.boundWidth, el.boundHeight);
  });

  // map elements
  stones.forEach((el) => {
    const elCoords = mapToScreenCoords(el.x, el.y);

    if (
      elCoords.x > viewWidth ||
      elCoords.y > viewHeight ||
      elCoords.x + el.width < 0 ||
      elCoords.y + el.height < 0
    ) {
      return;
    }

    // ctx.setTransform(1, 0, 0, 1, halfWidth, halfHeight);
    // ctx.rotate(0);
    ctx.drawImage(el.img, elCoords.x, elCoords.y, el.width, el.height);
    // ctx.setTransform(1, 0, 0, 1, 0, 0);
  });
  trees.forEach((el) => {
    if (el.dead) {
      return;
    }

    const elCoords = mapToScreenCoords(el.x, el.y);

    if (
      elCoords.x > viewWidth ||
      elCoords.y > viewHeight ||
      elCoords.x + el.width < 0 ||
      elCoords.y + el.height < 0
    ) {
      return;
    }

    // ctx.setTransform(1, 0, 0, 1, halfWidth, halfHeight);
    // ctx.rotate(0);
    ctx.drawImage(el.img, elCoords.x, elCoords.y, el.width, el.height);
    // ctx.setTransform(1, 0, 0, 1, 0, 0);
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
  // ctx.beginPath();
  // ctx.fillStyle = "#666";
  // ctx.strokeStyle = "#222";
  // ctx.lineWidth = 3;
  // ctx.arc(halfWidth, halfHeight, player.radius, 0, Math.PI * 2);
  // ctx.closePath();
  // ctx.fill();
  // ctx.stroke();

  // const x = halfWidth + 10 * Math.cos(player.facing);
  // const y = halfHeight + 10 * Math.sin(player.facing);

  // // facing dot
  // ctx.beginPath();
  // ctx.fillStyle = "#a34";
  // ctx.arc(x, y, 6, 0, Math.PI * 2);
  // ctx.closePath();
  // ctx.fill();

  ctx.setTransform(0.2, 0, 0, 0.2, halfWidth, halfHeight);
  ctx.rotate(player.facing);
  ctx.drawImage(playerImg, -289 / 2, -224 / 2);
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  // axe
  if (player.wcStart) {
    const percent = (time - 600 - player.wcStart) / 400;
    if (percent > 0 && percent <= 1) {
      ctx.setTransform(1, 0, 0, 1, halfWidth, halfHeight);
      ctx.rotate(player.facing + percent * 1.5);
      ctx.drawImage(axeImg, 0, -60);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
  }

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

  const cellSize = 50;
  const padding = 8;
  ctx.fillStyle = "#000";
  ctx.fillRect(10, viewHeight - cellSize - 10, cellSize, cellSize);
  ctx.drawImage(
    logImg,
    10 + padding,
    viewHeight - cellSize - 10 + padding,
    cellSize - padding * 2,
    cellSize - padding * 2
  );
  ctx.font = "20px monospace";
  ctx.textBaseline = "top";
  ctx.fillStyle = "#ed4";
  ctx.fillText(player.logs, 10 + 2, viewHeight - cellSize - 10 + 2);

  lastFrameTime = time;

  requestAnimationFrame(loop);
  // setTimeout(loop, 16);
}

loop();
