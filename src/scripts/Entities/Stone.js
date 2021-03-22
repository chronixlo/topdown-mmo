import { mapSize } from "..";
import { Entity } from "../Entity";
import { rand } from "../helpers";
import player from "../player";

export class Stone extends Entity {
  constructor(options) {
    super(options);

    this.type = "stone";
  }
}

const stoneImgs = new Array(9).fill().map((_, i) => {
  const img = new Image();
  img.src = `src/assets/stones/SM_00${i + 1}.png`;
  return img;
});

const stoneTypes = [
  {
    img: stoneImgs[0],
    width: 128,
    height: 128,
    boundWidth: 88,
    boundHeight: 96,
  },
  {
    img: stoneImgs[1],
    width: 128,
    height: 128,
    boundWidth: 96,
    boundHeight: 96,
  },
  {
    img: stoneImgs[2],
    width: 128,
    height: 128,
    boundWidth: 68,
    boundHeight: 80,
  },
  {
    img: stoneImgs[3],
    width: 128,
    height: 128,
    boundWidth: 86,
    boundHeight: 78,
  },
  {
    img: stoneImgs[4],
    width: 128,
    height: 128,
    boundWidth: 96,
    boundHeight: 64,
  },
  {
    img: stoneImgs[5],
    width: 128,
    height: 128,
    boundWidth: 114,
    boundHeight: 112,
  },
];

export const generateStone = () => {
  const stoneType = stoneTypes[rand(0, stoneTypes.length)];
  const { width, height } = stoneType;

  return new Stone(
    Object.assign(
      {
        x: rand(width, mapSize - width),
        y: rand(height, mapSize - height),
      },
      stoneType
    )
  );
};
