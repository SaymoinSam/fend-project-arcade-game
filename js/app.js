(function() {
'use strict';
const gameDom = {};
Array.prototype.forEach.call(document.querySelectorAll('*'), function(element) {
  element.classList[0] && (gameDom[`${element.classList[0]}`] = element);
});

function showElement(element) {
  element.classList.remove('hidden');
}

function hideElement(element) {
  element.classList.add('hidden');
}

function play(chosenPlayer) {
  const game = {},
    level1 = {
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
    },
    level2 = {
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
  game.levels = [level1, level2], game.canvas = document.querySelector("canvas");
  game.ctx = game.canvas.getContext("2d"), game.blocks = [];
  game.money = 0, game.lives = 3, game.level = 0;
  game.isPaused = false, game.running = setInterval(runTheGame, 30);
  game.controls = {37: "left", 38: "up", 39: "right", 40: "down"};
  game.images = {
    player: loadImage(`img/${chosenPlayer}.png`),
    superPlayer: loadImage(`img/${chosenPlayer}-super.png`),
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

  function loadImage(src) {
    const image = document.createElement("img");
    image.src = src;
    return image;
  }

  game.createPlayGround = function() {
    for(let x = 0;x < 6; x++) {
      for(let y = 0;y < 5; y++) {
        game.blocks.push(new Block(y, x, game.levels[game.level].playGround[x][y]));
      }
    }
  }

  game.createUnits = function() {
    for(let x = 0;x < game.levels[game.level].units.length; x++) {
      for(let y = 0; y < game.levels[game.level].units[x].length; y++) {
        const unit = game.levels[game.level].units[x][y];
        unit && game.blocks.push(new Block(y, x, unit));
      }
    }
    game.blocks.push(new Block(game.levels[game.level].exit, 0, "arrow"));
    game.levels[game.level].enemies.forEach(function(enemy){
      let anEnemy = new Enemy(...enemy);
      game.blocks.push(anEnemy);
    });
  }

  class Block {
    constructor(row, col, obj) {
      this.x = row * 100, this.y = col * 80, this.image = game.images[obj];
      this.draw(), this.class = obj;
    }
  }

  Block.prototype.draw = function() {
    let xStart = 0, xLong = 101, yStart = 50, yLong = 171;
    switch(this.class) {
      case "player": case "superPlayer": yStart = 60; break;
      case "enemy": case "reversedEnemy": yStart = 70; break;
      case "rock": yStart = 75; break;
      case "star": yStart = 60; break;
      case "heart": xStart = -15, yStart = 25, yLong = 120, xLong = 70; break;
      case "key": yStart = 40, yLong = 130; break;
      case "arrow": xStart = -10, xLong = 80, yStart = -5, yLong = 70; break;
      case "closedTreasure":
      case "openedTreasure": xStart = 0, yStart = 10, yLong = 100, xLong = 100; break;
      case "gemBlue": case "gemGreen": case "gemOrange":
        xStart = -20, yStart = 10, xLong = 60 , yLong = 80;
    }
    game.ctx.drawImage(this.image, this.x - xStart, this.y - yStart, xLong, yLong);
  }

  Block.prototype.equalsAnother = function(another) {
    return this.x === another.x && this.y === another.y;
  };

  Block.prototype.checkWater = function() {
    game.blocks.forEach(block => {
      if(block.class === "water" && block.equalsAnother(this)) {
        if(this.class === "player" || this.class === "superPlayer") {
          this.resetPosition(), --game.lives === 0 && loseTheGame(), updateLives();
        }else if(this.class === "rock") {
          let waterBlock = getWaterBlock(this);
          waterBlock.image = game.images.rockInWater;
          waterBlock.class = "rockInWater";
          game.blocks.splice(game.blocks.indexOf(this), 1);
        }
      }
    });
  }

  Block.prototype.getSiblingRocks = function() {
    let siblings = {left:{}, right:{}, up: {}, down: {}};
    game.blocks.forEach(block => {
      if(block.class === "rock") {
        this.x - block.x === 100 && this.y === block.y && (siblings.left = block);
        this.x - block.x === -100 && this.y === block.y && (siblings.right = block);
        this.y - block.y === 80 && this.x === block.x && (siblings.up = block);
        this.y - block.y === -80 && this.x === block.x && (siblings.down = block);
      }
    });
    return siblings;
  }

  function getWaterBlock(rockInWater) {
    let waterBlock;
    game.blocks.forEach(function(block) {
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
      this.speed = speed, this.direction = direction;
    }
  }

  Enemy.prototype.move = function() {
    if(this.hasHitSomething(game.player) && !game.player.isInvincible) {
      --game.lives === 0 && loseTheGame();
      updateLives(), game.player.resetPosition();
    }else {
      game.blocks.forEach(block => {
        if((block.class === "rock" || block.class === "water") &&
          this.hasHitSomething(block)) {
            this.speed = -this.speed;
            if(this.class === "enemy") {
              this.image = game.images.reversedEnemy, this.class = "reversedEnemy";
            }else {
              this.image = loadImage("img/enemy-bug.png"), this.class = "enemy";
            }
        }
      });
    }
    this.direction === "left" ? this.x -= this.speed : this.x += this.speed;
    this.x >= 500 ? this.x = -100 : this.x <= -100 && (this.x = 500);
  }

  Enemy.prototype.hasHitSomething = function(something) {
    return this.x - something.x <= 80 && this.x - something.x >= -80 &&
      this.y === something.y;
  }

  game.createPlayGround();
  game.createUnits();
  game.player = new Block(1, 5, "player");
  game.blocks.push(game.player);
  game.player.move = function (direction) {
    this.canMove(direction) && this.canPushRock(direction) ?
      moveUnit.call(this, direction) : !this.canMove("up") &&
        this.checkNextLevel();
    game.blocks.forEach(block => {
      if(block.class === "rock" && block.equalsAnother(this) &&
        this.canMove.call(block, direction)) {
          moveUnit.call(block, direction), block.checkWater();
      }
    });
    this.collectItem(), this.checkWater();
  }

  game.player.canMove = function(direction) {
    const siblings = this.getSiblingRocks();
    if(siblings[direction].class === "rock" &&
      this.getSiblingRocks.call(siblings[direction])[direction].class === "rock") {
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

  game.player.canPushRock = function(direction) {
    let canMove = true;
    game.blocks.forEach(block => {
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

  game.player.resetPosition = function() {
    this.x = 200, this.y = 400;
  }

  game.player.collectItem = function() {
    const collectedItems = ["star", "key", "heart", "gemBlue", "gemOrange",
      "gemGreen", "closedTreasure"];
    game.blocks.forEach(block => {
      if(this.equalsAnother(block) && collectedItems.indexOf(block.class) > -1) {
        let collectedItem = block.class;
        block.class === "closedTreasure" && checkTreasure(block) ||
          game.blocks.splice(game.blocks.indexOf(block), 1);
        handleCollectedItem(collectedItem);
      }
    });
  }

  game.player.checkNextLevel = function() {
    this.y === 0 && (this.x - this.x % 100) / 100 === game.levels[game.level].exit
    && (game.level++, game.blocks.splice(0), game.createPlayGround(),
      game.createUnits(), game.blocks.push(game.player), game.player.y = 400,
      gameDom["player-level"].children[0].innerHTML = game.level + 1);
  }

  function handleCollectedItem(collectedItem) {
    switch(collectedItem) {
      case "gemGreen": game.money += 500; updateMoney(); break;
      case "gemOrange": game.money += 800; updateMoney(); break;
      case "gemBlue": game.money += 1000; updateMoney(); break;
      case "heart": game.lives < 3 && (game.lives += 1); updateLives(); break;
      case "key": game.player.hasKey = true; break;
      case "star": game.player.isInvincible = true; handleInvincibility();
    }
  }

  function checkTreasure(treasure) {
    if(game.player.hasKey) {
      treasure.image = game.images.openedTreasure;
      treasure.class = "openedTreasure", game.player.x -= 100;
      setTimeout(function() {
        clearInterval(game.running), gameDom["game-over"].classList.remove("hidden");
        gameDom["game-message"].innerHTML = "You Win!";
      }, 1000);
    }
    return true;
  }

  function updateMoney() {
    gameDom["player-money"].children[0].innerHTML = game.money;
  }

  function updateLives() {
    gameDom["player-lives"].innerHTML = '<img src="img/heart.png">\n'.repeat(game.lives);
  }

  function loseTheGame() {
    clearInterval(game.running), showElement(gameDom["game-over"]);
    gameDom["game-message"].innerHTML = "You lose";
  }

  function handleInvincibility() {
    game.player.class = "superPlayer", game.player.image = game.images.superPlayer;
    setTimeout(function() {
      game.player.isInvincible = false, game.player.class = "player";
      game.player.image = game.images.player;
    }, 3000);
  }

  game.togglePause = function() {
    !this.isPaused ? (clearInterval(this.running), this.isPaused = true) :
      (this.running = setInterval(runTheGame, 30), this.isPaused = false);
  }

  game.restart = function() {
    this.money = 0, this.lives = 3, this.level = 0;
    this.isPaused = false, this.blocks.splice(0), this.createPlayGround();
    this.createUnits(), this.blocks.push(game.player), this.player.hasKey = false;
    this.player.isInvincible = false, this.player.class = "player";
    this.player.image = game.images.player, this.player.resetPosition();
    gameDom["player-level"].children[0].innerHTML = game.level + 1;
    updateMoney(), updateLives();
  }
  game.restart();

  function runTheGame() {
    game.blocks.forEach(function(block) {
      block.draw(), block.class.indexOf("nemy") > -1 && block.move();
    });
  }

  document.body.onkeyup = function(e) {
    if(game.isPaused) {
      e.keyCode === 80 && game.togglePause();
    }else {
      switch(e.keyCode) {
        case 37: case 38: case 39: case 40:
          game.player.move(game.controls[e.keyCode]); break;
        case 80: game.togglePause(); break;
        case 82: game.restart();
      }
    }
  }

  gameDom["game-over"].onclick = function(event) {
    event.target.nodeName === "BUTTON" && (play(chosenPlayer), game.restart(),
      hideElement(this));
  };

  hideElement(gameDom["player-selection"]), hideElement(gameDom["game-menu"]);
}

gameDom["game-menu"].onclick = function(event) {
  switch(event.target.textContent) {
    case "Play": hideElement(gameDom["game-menu"]);
      showElement(gameDom["player-selection"]); break;
    case "Game rules": showElement(gameDom["game-rules"]); break;
    case "Controls": showElement(gameDom["game-controls"]);
  }
};

gameDom["game-modal"].onclick = function(event) {
  event.target.className === "close-button" &&
    hideElement(event.target.parentElement);
};

gameDom["player-selection"].onclick = function(event) {
  event.target.nodeName === "IMG" && play(event.target.alt);
};
}());