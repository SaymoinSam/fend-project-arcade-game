const  canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

function loadImage(src) {
  const image = document.createElement("img");
  image.src = src;
  return image;
}

const gameImages = {
  player: loadImage("img/char-boy.png"),
  enemy: loadImage("img/enemy-bug.png"),
  rock: loadImage("img/rock.png"),
  grass: loadImage("img/grass-block.png"),
  stone: loadImage("img/stone-block.png"),
  water: loadImage("img/water-block.png"),
  gemBlue: loadImage("img/gem-blue.png"),
  gemGreen: loadImage("img/gem-green.png"),
  gemOrange: loadImage("img/gem-orange.png"),
  key: loadImage("img/key.png"),
  heart: loadImage("img/heart.png"),
  star: loadImage("img/star.png")
};

const playGround = [
  ["water","water","water","water","water"],
  ["stone","stone","stone","stone","stone"],
  ["stone","stone","stone","stone","stone"],
  ["stone","stone","stone","stone","stone"],
  ["grass","grass","grass","grass","grass"],
  ["grass","grass","grass","grass","grass"]
];

const units = [
  ["","","","",""],
  ["","key","","rock",""],
  ["gemBlue","gemOrange","gemGreen","",""],
  ["star","heart","","",""],
  ["","rock","rock","",""],
  ["","","","",""]
];

const gameBlocks = [];

function drawPlayGround() {
  for(let x = 0;x < 6; x++) {
    for(let y = 0;y < 5; y++) {
      gameBlocks.push(new Block(y, x, playGround[x][y]));
    }
  }
}

function drawUnits() {
  for(let x = 0;x < units.length; x++) {
    for(let y = 0; y < units[x].length; y++) {
      const unit = units[x][y];
      if(unit) {
        gameBlocks.push(new Block(y, x, unit));
      }
    }
  }
}

class Block {
  constructor(row, col, obj) {
    this.x = row * 100;
    this.y = col * 80;
    this.image = gameImages[obj];
    this.draw();
    this.class = obj;
  }
}

Block.prototype.draw = function() {
  let xStart = 0,
    xLong = 101,
    yStart = 50,
    yLong = 171;
  switch(this.class) {
    case "player": yStart = 60; break;
    case "enemy": yStart = 70; break;
    case "rock": yStart = 75; break;
    case "star": yStart = 60; break;
    case "heart": xStart = -15, yStart = 25, yLong = 120, xLong = 70; break;
    case "key": yStart = 40, yLong = 130; break;
    case "gemBlue": case "gemGreen": case "gemOrange":
      xStart = -20, yStart = 10, xLong = 60 , yLong = 80;
  }
  ctx.drawImage(this.image, this.x - xStart, this.y - yStart, xLong, yLong);
}

drawPlayGround();
drawUnits();

setInterval(function() {
  gameBlocks.forEach(function(block) {
    block.draw();
  });
}, 30);

