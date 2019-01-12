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
  reversedEnemy: loadImage("img/enemy-bug-reverse.png"),
  rock: loadImage("img/rock.png"),
  rockInWater : loadImage("img/rock-in-water.png"),
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
  ["water","stone","stone","stone","stone"],
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

const enemies = [
  /*[4, 1, 2, "left"],
  [1, 2, 5],
  [1, 3, 8, "left"]*/
];

const gameBlocks = [];
const gameEnemies = [];

controls = {37: "left", 38: "up", 39: "right", 40: "down"};

function createPlayGround() {
  for(let x = 0;x < 6; x++) {
    for(let y = 0;y < 5; y++) {
      gameBlocks.push(new Block(y, x, playGround[x][y]));
    }
  }
}

function createUnits() {
  for(let x = 0;x < units.length; x++) {
    for(let y = 0; y < units[x].length; y++) {
      const unit = units[x][y];
      if(unit) {
        gameBlocks.push(new Block(y, x, unit));
      }
    }
  }

  enemies.forEach(function(enemy){
    let anEnemy = new Enemy(...enemy);
    gameBlocks.push(anEnemy);
    gameEnemies.push(anEnemy);
  });
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
    case "enemy": case "reversedEnemy": yStart = 70; break;
    case "rock": yStart = 75; break;
    case "star": yStart = 60; break;
    case "heart": xStart = -15, yStart = 25, yLong = 120, xLong = 70; break;
    case "key": yStart = 40, yLong = 130; break;
    case "gemBlue": case "gemGreen": case "gemOrange":
      xStart = -20, yStart = 10, xLong = 60 , yLong = 80;
  }
  ctx.drawImage(this.image, this.x - xStart, this.y - yStart, xLong, yLong);
}

Block.prototype.equalsAnother = function(another) {
  return this.x === another.x && this.y === another.y;
}

Block.prototype.checkWater = function() {
  gameBlocks.forEach(block => {
    if(block.class === "water" && block.equalsAnother(this)) {
      if(this.class === "player") {
        this.resetPosition();
      }else if(this.class === "rock") {
        let waterBlock = getWaterBlock(this);
        waterBlock.image = loadImage("img/rock-in-water.png")
        waterBlock.class = "rockInWater";
        console.log(waterBlock);
        gameBlocks.splice(gameBlocks.indexOf(this), 1);
        console.log("rock in the water");
      }
    }
  });
}

Block.prototype.getSiblings = function() {
  let siblings = {left:{}, right:{}, up: {}, down: {}};
  gameBlocks.forEach(block => {
    if(block.class === "rock") {
      if(this.x - block.x === 100 && this.y === block.y) {
        siblings.left = block;
      }
      if(this.x - block.x === -100 && this.y === block.y) {
        siblings.right = block;
      }
      if(this.y - block.y === 80 && this.x === block.x) {
        siblings.up = block;
      }
      if(this.y - block.y === -80 && this.x === block.x) {
        siblings.down = block;
      }
    }
  });
  return siblings;
}

function getWaterBlock(rockInWater) {
  let waterBlock;
  gameBlocks.forEach(function(block) {
    if(block.equalsAnother(rockInWater) && block.class === "water") {
      return waterBlock = block;
    }
  });
  return waterBlock;
}

function moveUnit(direction) {
  switch(direction) {
    case "left": this.x -= 100; break;
    case "up": this.y -= 80; break;
    case "right": this.x += 100; break;
    case "down": this.y += 80;
  }
}

class Enemy extends Block {
  constructor(x, y, speed, direction) {
    super(x, y, direction === "left" ? "reversedEnemy" : "enemy", speed);
    this.speed = speed;
    this.direction = direction;
  }
}

Enemy.prototype.move = function() {
  if(this.hasHitSomething(player)) {
    console.log("player is dead!");
    player.resetPosition();
  }else {
    gameBlocks.forEach(block => {
      if((block.class === "rock" || block.class === "water") && this.hasHitSomething(block)) {
        this.speed = -this.speed;
        if(this.class === "enemy") {
          this.image = loadImage("img/enemy-bug-reverse.png");
          this.class = "reversedEnemy";
        }else {
          this.image = loadImage("img/enemy-bug.png");
          this.class = "enemy";
        }
        console.log("enemy has hit a rock");
      }
    });
  }
  if(this.direction === "left") {
    this.x -= this.speed;
  }else {
    this.x += this.speed;
  }
  if(this.x >= 500) {
    this.x = -100;
  }else if(this.x <= -100) {
    this.x = 500;
  }
}

Enemy.prototype.hasHitSomething = function(something) {
  return this.x - something.x <= 80 &&
         this.x - something.x >= -80 &&
         this.y === something.y;
}

document.body.onkeyup = function(e) {
  switch(e.keyCode) {
    case 37: case 38: case 39: case 40:
      player.move(controls[e.keyCode]);
    default: console.log(e.keyCode);
  }
}

createPlayGround();
createUnits();

const player = new Block(1, 5, "player");
gameBlocks.push(player);
player.move = function (direction) {
  if(this.canMove(direction) && this.canPushRock(direction)) {
    moveUnit.call(this, direction);
  }
  gameBlocks.forEach(block => {
    if(block.class === "rock" && block.equalsAnother(player) && this.canMove.call(block, direction)) {
      moveUnit.call(block, direction);
      block.checkWater();
    }
  });
  this.checkWater();
}

player.canMove = function(direction) {
  const siblings = this.getSiblings();
  if(siblings.left.class === "rock" && this.getSiblings.call(siblings.left).left.class === "rock" && direction === "left") {
    console.log("can't move left");
    return false;
  }else if(siblings.right.class === "rock" && this.getSiblings.call(siblings.right).right.class === "rock" && direction === "right") {
    console.log("can't move right");
    return false;
  }else if(siblings.up.class === "rock" && this.getSiblings.call(siblings.up).up.class === "rock" && direction === "up") {
    console.log("can't move up");
    return false;
  }else if(siblings.down.class === "rock" && this.getSiblings.call(siblings.down).down.class === "rock" && direction === "down") {
    console.log("can't move down");
    return false;
  }
  if(this.x === 0 && direction === "left" ||
    this.x === 400 && direction === "right" ||
    this.y === 0 && direction === "up" ||
    this.y === 400 && direction === "down") {
      return false;
  }
  return true;
}

player.canPushRock = function(direction) {
  let canMove = true;
  gameBlocks.forEach(block => {
    if(block.class === "rock" && !this.canMove.call(block, direction)) {
      if(block.x - this.x === 100 && block.y === this.y && direction === "right") {
        return canMove = false;
      }else if(block.x - this.x === -100 && block.y === this.y && direction === "left") {
        return canMove = false;
      }else if(block.y - this.y === 80 && block.x === this.x && direction === "down") {
        return canMove = false;
      }else if(block.y - this.y === -80 && block.x === this.x && direction === "up") {
        return canMove = false;
      }
    }
  });
  return canMove;
}

player.resetPosition = function() {
  player.x = 200;
  player.y = 400;
}

setInterval(function() {
  gameBlocks.forEach(function(block) {
    block.draw();
  });
  gameEnemies.forEach(function(enemy) {
    enemy.move();
  });
}, 30);

