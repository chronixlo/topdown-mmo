import { mapSize } from "..";
import { Entity } from "../Entity";
import { rand } from "../helpers";
import player from "../player";

export class Tree extends Entity {
  constructor(options) {
    super(options);

    this.type = "tree";
    this.logs = options.logs;
    this.dead = false;
  }
}

const treeImgs = new Array(10).fill().map((_, i) => {
  const img = new Image();
  img.src = `src/assets/trees/RE_0${i}.png`;
  return img;
});

const treeTypes = [
  {
    img: treeImgs[0],
    width: 128,
    height: 128,
    logs: 12,
    boundWidth: 96,
    boundHeight: 86,
  },
  {
    img: treeImgs[1],
    width: 128,
    height: 128,
    logs: 15,
    boundWidth: 108,
    boundHeight: 78,
  },
  {
    img: treeImgs[2],
    width: 128,
    height: 128,
    logs: 9,
    boundWidth: 86,
    boundHeight: 86,
  },
  {
    img: treeImgs[3],
    width: 128,
    height: 128,
    logs: 9,
    boundWidth: 86,
    boundHeight: 86,
  },
  {
    img: treeImgs[4],
    width: 128,
    height: 128,
    logs: 3,
    boundWidth: 60,
    boundHeight: 60,
  },
  {
    img: treeImgs[5],
    width: 128,
    height: 128,
    logs: 6,
    boundWidth: 78,
    boundHeight: 76,
  },
];

export const generateTree = () => {
  const treeType = treeTypes[rand(0, treeTypes.length)];
  const { width, height } = treeType;

  return new Tree(
    Object.assign(
      {
        x: rand(width, mapSize - width),
        y: rand(height, mapSize - height),
      },
      treeType
    )
  );
};
