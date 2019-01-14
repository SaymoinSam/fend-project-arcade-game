function play() {
  document.querySelector(".game-menu").classList.add("hidden");
  const  canvas = document.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  let money = 0;
  let lives = 3;
  let level = 0;
  let isPaused = false;
  let running = setInterval(runTheGame, 30);

  function loadImage(src) {
    const image = document.createElement("img");
    image.src = src;
    return image;
  }

  const game = {};

  game.images = {
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
    star: loadImage("img/star.png"),
    arrow: loadImage("img/arrow.png"),
    closedTreasure: loadImage("img/closed-treasure.png"),
    openedTreasure: loadImage("img/opened-treasure.png")
  };

  const level1 = {
    playGround: [
      ["water","water","water","water","water"],
      ["water","stone","stone","stone","stone"],
      ["stone","stone","stone","stone","stone"],
      ["stone","stone","stone","stone","stone"],
      ["grass","grass","grass","grass","grass"],
      ["grass","grass","grass","grass","grass"]
    ],
    units: [
      ["","","","",""],
      ["","key","","rock",""],
      ["gemBlue","gemOrange","gemGreen","",""],
      ["star","heart","","",""],
      ["","rock","rock","openedTreasure",""],
      ["","","","","closedTreasure"]
    ],
    enemies: [
      [4, 1, 2, "left"],
      [1, 2, 5],
      [1, 3, 8, "left"]
    ],
    exit: 2
  };

  const level2 = {
    playGround: [
      ["water","water","water","water","water"],
      ["water","stone","stone","stone","stone"],
      ["stone","stone","stone","stone","stone"],
      ["stone","stone","stone","stone","stone"],
      ["grass","grass","grass","grass","grass"],
      ["grass","grass","grass","grass","grass"]
    ],
    units: [
      ["","","","",""],
      ["","key","","rock",""],
      ["","","","",""],
      ["star","heart","","",""],
      ["","rock","rock","",""],
      ["","","","",""]
    ],
    enemies: [
      [4, 1, 2, "left"],
      [1, 2, 5],
    ],
  };

  game.levels = [level1, level2];

  const gameBlocks = [];
  const gameEnemies = [];

  controls = {37: "left", 38: "up", 39: "right", 40: "down"};

  function createPlayGround() {
    for(let x = 0;x < 6; x++) {
      for(let y = 0;y < 5; y++) {
        gameBlocks.push(new Block(y, x, game.levels[level].playGround[x][y]));
      }
    }
  }

  function createUnits() {
    for(let x = 0;x < game.levels[level].units.length; x++) {
      for(let y = 0; y < game.levels[level].units[x].length; y++) {
        const unit = game.levels[level].units[x][y];
        if(unit) {
          gameBlocks.push(new Block(y, x, unit));
        }
      }
    }

    gameBlocks.push(new Block(game.levels[level].exit, 0, "arrow"));

    game.levels[level].enemies.forEach(function(enemy){
      let anEnemy = new Enemy(...enemy);
      gameBlocks.push(anEnemy);
      gameEnemies.push(anEnemy);
    });
  }

  class Block {
    constructor(row, col, obj) {
      this.x = row * 100;
      this.y = col * 80;
      this.image = game.images[obj];
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
      case "player": case "superPlayer": yStart = 60; break;
      case "enemy": case "reversedEnemy": yStart = 70; break;
      case "rock": yStart = 75; break;
      case "star": yStart = 60; break;
      case "heart": xStart = -15, yStart = 25, yLong = 120, xLong = 70; break;
      case "key": yStart = 40, yLong = 130; break;
      case "arrow": xStart = -10, xLong = 80, yStart = -5, yLong = 70; break;
      case "closedTreasure": case "openedTreasure": xStart = 0, yStart = 10, yLong = 100, xLong = 100; break;
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
        if(this.class === "player" || this.class === "superPlayer") {
          this.resetPosition();
          --lives === 0 && loseTheGame();
          updateLives();
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
    if(this.hasHitSomething(player) && !player.isInvincible) {
      console.log("player is dead!");
      --lives === 0 && loseTheGame();
      updateLives();
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
    if(isPaused) {
      e.keyCode === 80 && togglePause();
    }else {
      switch(e.keyCode) {
        case 37: case 38: case 39: case 40:
          player.move(controls[e.keyCode]); break;
        case 80: togglePause(); break;
        case 82: restart(); break;
        default: console.log(e.keyCode);
      }
    }
  }

  createPlayGround();
  createUnits();

  const player = new Block(1, 5, "player");
  gameBlocks.push(player);
  player.move = function (direction) {
    if(this.canMove(direction) && this.canPushRock(direction)) {
      moveUnit.call(this, direction);
    }else if(!this.canMove("up")) {
      this.checkNextLevel();
    }
    this.collectItem();
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

  player.collectItem = function() {
    const collectedItems = ["star", "key", "heart", "gemBlue", "gemOrange", "gemGreen", "closedTreasure"];
    gameBlocks.forEach(block => {
      if(this.equalsAnother(block) && collectedItems.indexOf(block.class) > -1) {
        let collectedItem = block.class;
        block.class === "closedTreasure" && checkTreasure(block) || gameBlocks.splice(gameBlocks.indexOf(block), 1);
        handleCollectedItem(collectedItem);
      }
    });
  }

  player.checkNextLevel = function() {
    if(this.y === 0 && (this.x - this.x % 100) / 100 === game.levels[level].exit) {
      console.log("To the next level");
      level++;
      gameBlocks.splice(0);
      gameEnemies.splice(0);
      createPlayGround();
      createUnits();
      gameBlocks.push(player);
      player.y = 400;
      document.querySelector(".player-level").children[0].innerHTML = level + 1;
    }
  }

  function handleCollectedItem(collectedItem) {
    switch(collectedItem) {
      case "gemGreen": money += 500; updateMoney(); break;
      case "gemOrange": money += 800; updateMoney(); break;
      case "gemBlue": money += 1000; updateMoney(); break;
      case "heart": lives < 3 && (lives += 1); updateLives(); break;
      case "key": player.hasKey = true; break;
      case "star": player.isInvincible = true; handleInvincibility();
    }
  }

  function checkTreasure(treasure) {
    if(player.hasKey) {
      treasure.image = loadImage("img/opened-treasure.png");
      treasure.class = "openedTreasure";
      player.x -= 100;
      setTimeout(function() {
        alert("You won");
      }, 1000);
    }
    return true;
  }

  function updateMoney() {
    document.querySelector(".player-money").children[0].innerHTML = money;
  }

  function updateLives() {
    document.querySelector(".player-lives").innerHTML = '<img src="img/heart.png">\n'.repeat(lives);
  }

  function loseTheGame() {
    alert("You lose!");
  }

  function handleInvincibility() {
    player.class = "superPlayer";
    player.image = loadImage("img/char-boy-super.png");
    setTimeout(function() {
      player.isInvincible = false;
      player.class = "player";
      player.image = loadImage("img/char-boy.png");
    }, 3000);
  }

  function togglePause() {
    if(!isPaused) {
      clearInterval(running);
      isPaused = true;
    }else {
      running = setInterval(runTheGame, 30);
      isPaused = false;
    }
  }

  function restart() {
    money = 0;
    lives = 3;
    level = 0;
    isPaused = false;
    gameBlocks.splice(0);
    gameEnemies.splice(0);
    createPlayGround();
    createUnits();
    gameBlocks.push(player);
    player.hasKey = false;
    player.isInvincible = false;
    player.class = "player";
    player.image = loadImage("img/char-boy.png");
    player.resetPosition();
    document.querySelector(".player-level").children[0].innerHTML = level + 1;
    updateMoney();
    updateLives();
  }

  function runTheGame() {
    gameBlocks.forEach(function(block) {
      block.draw();
    });
    gameEnemies.forEach(function(enemy) {
      enemy.move();
    });
  }
}

function showGameRules() {
  document.querySelector(".game-rules").classList.remove("hidden");
}

function showGameControls() {
  document.querySelector(".game-controls").classList.remove("hidden");
}

document.querySelector(".game-menu").onclick = function(event) {
  switch(event.target.textContent) {
    case "Play": play(); break;
    case "Game rules": showGameRules(); break;
    case "Controls": showGameControls();
  }
};

document.querySelector(".game-modal").onclick = function(event) {
  if(event.target.className === "close-button") {
    event.target.parentElement.classList.add("hidden");
  }
};

