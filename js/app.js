(function() {
'use strict';
const GAME_DOM = {};
Array.prototype.forEach.call(document.querySelectorAll('*'), function(element) {
  element.classList[0] && (GAME_DOM[`${element.classList[0]}`] = element);
});

const GAME_SCREEN = {};
GAME_SCREEN.canvas = document.querySelector('canvas');
/**
* @description sets the size of the game
*/
function setGamesize() {
  let width, height;
  window.outerWidth >= 452 ? (width = 450, height = 420) :
    window.outerWidth >= 402 ? (width = 400, height = 360) :
    window.outerWidth >= 352 ? (width = 350, height = 300) :
    window.outerWidth >= 302 ? (width = 300, height = 240) :
      width = 250, height = 180;
  window.outerWidth >= 502 && (width = 500, height = 480);
  GAME_SCREEN.width = width, GAME_SCREEN.height = height;
  GAME_SCREEN.canvas.width = width, GAME_SCREEN.canvas.height = height;
  GAME_SCREEN.cellWidth = width / 5, GAME_SCREEN.cellHeight = height / 6;
  GAME_SCREEN.widthConst = width / 500 > 1 ? 1 : width / 500,
  GAME_SCREEN.heightConst = height / 480 > 1 ? 1 : height / 480;
}
setGamesize();
/**
* @description Shows an element
* @param {object} element - The DOM object
*/
function showElement(element) {
  element.classList.remove('hidden');
}
/**
* @description Hides an element
* @param {object} element - The DOM object
*/
function hideElement(element) {
  element.classList.add('hidden');
}
/**
* @description Starts the game
* @param {string} chosenPlayer - The character's name
*/
function play(chosenPlayer) {
  const GAME = {},
    level1 = {
      playGround: [
        ['water','water','water','water','water'],
        ['water','stone','stone','stone','stone'],
        ['stone','stone','stone','stone','stone'],
        ['stone','stone','stone','stone','stone'],
        ['grass','grass','grass','grass','grass'],
        ['grass','grass','grass','grass','grass']
      ],
      units: [
        ['','','','',''],
        ['','key','','rock',''],
        ['gemBlue','gemOrange','gemGreen','',''],
        ['star','heart','','',''],
        ['','rock','rock','openedTreasure',''],
        ['','','','','closedTreasure']
      ],
      enemies: [
        [4, 1, 2, 'left'],
        [1, 2, 5],
        [1, 3, 8, 'left']
      ],
      exit: 2
    },
    level2 = {
      playGround: [
        ['water','water','water','water','water'],
        ['water','stone','stone','stone','stone'],
        ['stone','stone','stone','stone','stone'],
        ['stone','stone','stone','stone','stone'],
        ['grass','grass','grass','grass','grass'],
        ['grass','grass','grass','grass','grass']
      ],
      units: [
        ['','','','',''],
        ['','key','','rock',''],
        ['','','','',''],
        ['star','heart','','',''],
        ['','rock','rock','',''],
        ['','','','','']
      ],
      enemies: [
        [4, 1, 2, 'left'],
        [1, 2, 5],
      ],
    };
  GAME.levels = [level1, level2], GAME.canvas = document.querySelector('canvas');
  GAME.ctx = GAME.canvas.getContext('2d'), GAME.blocks = [];
  GAME.money = 0, GAME.lives = 3, GAME.level = 0;
  GAME.isPaused = false, GAME.running = setInterval(runTheGame, 35);
  GAME.controls = {37: 'left', 38: 'up', 39: 'right', 40: 'down'};
  GAME.clickPoints = [], GAME.isDragging = false;
  GAME.images = {
    player: loadImage(`img/${chosenPlayer}.png`),
    superPlayer: loadImage(`img/${chosenPlayer}-super.png`),
    enemy: loadImage('img/enemy-bug.png'),
    reversedEnemy: loadImage('img/enemy-bug-reverse.png'),
    rock: loadImage('img/rock.png'),
    rockInWater : loadImage('img/rock-in-water.png'),
    grass: loadImage('img/grass-block.png'),
    stone: loadImage('img/stone-block.png'),
    water: loadImage('img/water-block.png'),
    gemBlue: loadImage('img/gem-blue.png'),
    gemGreen: loadImage('img/gem-green.png'),
    gemOrange: loadImage('img/gem-orange.png'),
    key: loadImage('img/key.png'),
    heart: loadImage('img/heart.png'),
    star: loadImage('img/star.png'),
    arrow: loadImage('img/arrow.png'),
    closedTreasure: loadImage('img/closed-treasure.png'),
    openedTreasure: loadImage('img/opened-treasure.png')
  };
  /**
  * @description Loads images
  * @param {string} src - The src of the image
  * @returns {object} the loaded image
  */
  function loadImage(src) {
    const IMAGE = document.createElement('img');
    IMAGE.src = src;
    return IMAGE;
  }
  /**
  * @description Creates the playground of the game
  */
  GAME.createPlayGround = function() {
    for(let x = 0;x < 6; x++) {
      for(let y = 0;y < 5; y++) {
        GAME.blocks.push(new Block(y, x, GAME.levels[GAME.level].playGround[x][y]));
      }
    }
  };
  /**
  * @description Creates the units of the game
  */
  GAME.createUnits = function() {
    for(let x = 0;x < GAME.levels[GAME.level].units.length; x++) {
      for(let y = 0; y < GAME.levels[GAME.level].units[x].length; y++) {
        const UNIT = GAME.levels[GAME.level].units[x][y];
        UNIT && GAME.blocks.push(new Block(y, x, UNIT));
      }
    }
    GAME.blocks.push(new Block(GAME.levels[GAME.level].exit, 0, 'arrow'));
    GAME.levels[GAME.level].enemies.forEach(function(enemy){
      let anEnemy = new Enemy(...enemy);
      GAME.blocks.push(anEnemy);
    });
  };
  /**
  * @constructor Block
  * @description Creates a new block
  * @param {number} row - the number of row
  * @param {number} col - the number of column
  * @param {string} obj - the block name
  */
  class Block {
    constructor(col, row, obj) {
      this.x = col * GAME_SCREEN.cellWidth, this.y = row * GAME_SCREEN.cellHeight, this.image = GAME.images[obj];
      this.draw(), this.class = obj;
    }
  }
  /**
  * @description Draws the block
  */
  Block.prototype.draw = function() {
    let xStart = 0, xLong = 101, yStart = 50, yLong = 171;
    switch(this.class) {
      case 'player': case 'superPlayer': yStart = 60; break;
      case 'enemy': case 'reversedEnemy': yStart = 70; break;
      case 'rock': yStart = 75; break;
      case 'star': yStart = 60; break;
      case 'heart': xStart = -15, yStart = 25, yLong = 120, xLong = 70; break;
      case 'key': yStart = 40, yLong = 130; break;
      case 'arrow': xStart = -10, xLong = 80, yStart = -5, yLong = 70; break;
      case 'closedTreasure':
      case 'openedTreasure': xStart = 0, yStart = 10, yLong = 100, xLong = 100; break;
      case 'gemBlue': case 'gemGreen': case 'gemOrange':
        xStart = -20, yStart = 10, xLong = 60 , yLong = 80;
    }
    GAME.ctx.drawImage(this.image, this.x - (xStart * GAME_SCREEN.widthConst),
      this.y - (yStart * GAME_SCREEN.heightConst),
      xLong * GAME_SCREEN.widthConst, yLong * GAME_SCREEN.heightConst);
  };
  /**
  * @description Checks if a block equals another block
  * @param {object} another - the block to check against
  * @returns {boolean} block equals another block or not
  */
  Block.prototype.equalsAnother = function(another) {
    return this.x === another.x && this.y === another.y;
  };
  /**
  * @description Checks if a block is in water then handles it
  */
  Block.prototype.checkWater = function() {
    GAME.blocks.forEach(block => {
      if(block.class === 'water' && block.equalsAnother(this)) {
        if(this.class === 'player' || this.class === 'superPlayer') {
          --GAME.lives === 0 && loseTheGame(), updateLives(),
          setTimeout(_=> {
            GAME.player.resetPosition();
            GAME.togglePause();
          }, 50);
          setTimeout(_=> {
            GAME.togglePause();
          }, 300);
        }else if(this.class === 'rock') {
          let waterBlock = getWaterBlock(this);
          waterBlock.image = GAME.images.rockInWater;
          waterBlock.class = 'rockInWater';
          GAME.blocks.splice(GAME.blocks.indexOf(this), 1);
        }
      }
    });
  };
  /**
  * @description Gets all sibling rocks
  * @returns {object} SIBLINGS - the sibling rocks
  */
  Block.prototype.getSiblingRocks = function() {
    const SIBLINGS = {left:{}, right:{}, up: {}, down: {}};
    GAME.blocks.forEach(block => {
      if(block.class === 'rock') {
        this.x - block.x === GAME_SCREEN.cellWidth &&
          this.y === block.y && (SIBLINGS.left = block);
        this.x - block.x === -GAME_SCREEN.cellWidth &&
          this.y === block.y && (SIBLINGS.right = block);
        this.y - block.y === GAME_SCREEN.cellHeight &&
          this.x === block.x && (SIBLINGS.up = block);
        this.y - block.y === -GAME_SCREEN.cellHeight &&
          this.x === block.x && (SIBLINGS.down = block);
      }
    });
    return SIBLINGS;
  };
  /**
  * @description Gets the water block that has a rock in it
  * @param {object} rockInWater - the rock to check against
  * @returns {object} the water object
  */
  function getWaterBlock(rockInWater) {
    let waterBlock;
    GAME.blocks.forEach(function(block) {
      if(block.equalsAnother(rockInWater) && block.class === 'water') {
        return waterBlock = block;
      }
    });
    return waterBlock;
  }
  /**
  * @description Moves a unit
  * @param {string} direction - the direction to move the unit to
  */
  function moveUnit(direction) {
    switch(direction) {
      case 'left': this.x -= GAME_SCREEN.cellWidth; break;
      case 'up': this.y -= GAME_SCREEN.cellHeight; break;
      case 'right': this.x += GAME_SCREEN.cellWidth; break;
      case 'down': this.y += GAME_SCREEN.cellHeight;
    }
  }
  /**
  * @constructor Enemy
  * @description Creates a new enemy
  * @param {number} x - the number of column
  * @param {number} y - the number of row
  * @param {number} speed - the speed of the enemy
  * @param {string} direction - the direction the enemy moves in
  */
  class Enemy extends Block {
    constructor(x, y, speed, direction) {
      super(x, y, direction === 'left' ? 'reversedEnemy' : 'enemy', speed);
      this.speed = speed, this.direction = direction;
    }
  }
  /**
  * @description Handles the enemy's moving
  */
  Enemy.prototype.move = function() {
    if(this.hasHitSomething(GAME.player) && !GAME.player.isInvincible) {
      --GAME.lives === 0 && loseTheGame();
      updateLives(), GAME.togglePause();
      setTimeout(function() {
        GAME.player.resetPosition(), GAME.togglePause();
      }, 300);
    }else {
      GAME.blocks.forEach(block => {
        if((block.class === 'rock' || block.class === 'water' ||
        block.class === 'superPlayer') &&
          this.hasHitSomething(block)) {
            this.speed = -this.speed;
            if(this.class === 'enemy') {
              this.image = GAME.images.reversedEnemy, this.class = 'reversedEnemy';
            }else {
              this.image = loadImage('img/enemy-bug.png'), this.class = 'enemy';
            }
        }
      });
    }
    this.direction === 'left' ? this.x -= this.speed : this.x += this.speed;
    this.x >= GAME_SCREEN.width ? this.x = -GAME_SCREEN.cellWidth :
      this.x <= -GAME_SCREEN.cellWidth && (this.x = GAME_SCREEN.width);
  };
  /**
  * @description Returns if an enemy collided with something
  * @param {object} something - the block to check against
  * @returns {boolean} if an enemy collided with something
  */
  Enemy.prototype.hasHitSomething = function(something) {
    return this.x - something.x <= GAME_SCREEN.cellWidth - GAME_SCREEN.cellWidth /
    5 && this.x - something.x >= -(GAME_SCREEN.cellWidth - GAME_SCREEN.cellWidth / 5) &&
      this.y === something.y;
  };

  GAME.createPlayGround();
  GAME.createUnits();
  GAME.player = new Block(1, 5, 'player');
  GAME.blocks.push(GAME.player);
  /**
  * @description Handles the player's moving
  * @param {string} direction - the direction to move the player in
  */
  GAME.player.move = function (direction) {
    this.canMove(direction) && this.canPushRock(direction) ?
      moveUnit.call(this, direction) : !this.canMove('up') &&
        this.checkNextLevel();
    GAME.blocks.forEach(block => {
      if(block.class === 'rock' && block.equalsAnother(this) &&
        this.canMove.call(block, direction)) {
          moveUnit.call(block, direction), block.checkWater();
      }
    });
    this.collectItem(), this.checkWater();
  };
  /**
  * @description Returns if the player can move
  * @param {string} direction - the direction the player wants to move in
  * @returns {boolean} if the player can move in the given direction
  */
  GAME.player.canMove = function(direction) {
    const SIBLINGS = this.getSiblingRocks();
    if(SIBLINGS[direction].class === 'rock' &&
      this.getSiblingRocks.call(SIBLINGS[direction])[direction].class === 'rock') {
        return false;
    }
    if(this.x === 0 && direction === 'left' ||
      this.x === GAME_SCREEN.cellWidth * 4 && direction === 'right' ||
      this.y === 0 && direction === 'up' ||
      this.y === GAME_SCREEN.cellHeight * 5 && direction === 'down') {
        return false;
    }
    return true;
  };
  /**
  * @description Returns if the player can push a rock
  * @param {string} direction - the direction the player wants to push the rock in
  * @returns {boolean} if the player can push a rock in the given direction
  */
  GAME.player.canPushRock = function(direction) {
    let canMove = true;
    GAME.blocks.forEach(block => {
      if(block.class === 'rock' && !this.canMove.call(block, direction)) {
        if(block.x - this.x === GAME_SCREEN.cellWidth && block.y === this.y && direction === 'right') {
          return canMove = false;
        }else if(block.x - this.x === -GAME_SCREEN.cellWidth &&
         block.y === this.y && direction === 'left') {
          return canMove = false;
        }else if(block.y - this.y === GAME_SCREEN.cellHeight &&
         block.x === this.x && direction === 'down') {
          return canMove = false;
        }else if(block.y - this.y === -GAME_SCREEN.cellHeight &&
         block.x === this.x && direction === 'up') {
          return canMove = false;
        }
      }
    });
    return canMove;
  };
  /**
  * @description Resets the player's position
  */
  GAME.player.resetPosition = function() {
    this.x = GAME_SCREEN.cellWidth * 2, this.y = GAME_SCREEN.cellHeight * 5;
  };
  /**
  * @description Handles collecting items
  */
  GAME.player.collectItem = function() {
    const COLLECTED_ITEMS = ['star', 'key', 'heart', 'gemBlue', 'gemOrange',
      'gemGreen', 'closedTreasure'];
    GAME.blocks.forEach(block => {
      if(this.equalsAnother(block) && COLLECTED_ITEMS.indexOf(block.class) > -1) {
        let collectedItem = block.class;
        block.class === 'closedTreasure' && checkTreasure(block) ||
          GAME.blocks.splice(GAME.blocks.indexOf(block), 1);
        handleCollectedItem(collectedItem);
      }
    });
  };
  /**
  * @description Handles going to the next level
  */
  GAME.player.checkNextLevel = function() {
    this.y === 0 && (this.x - this.x %
     GAME_SCREEN.cellWidth) / GAME_SCREEN.cellWidth === GAME.levels[GAME.level].exit
    && (GAME.level++, GAME.blocks.splice(0), GAME.createPlayGround(),
      GAME.createUnits(), GAME.blocks.push(GAME.player),
      GAME.player.y = GAME_SCREEN.cellHeight * 5,
      GAME_DOM['player-level'].children[0].innerHTML = GAME.level + 1);
  };
  /**
  * @description Take action on different collected items
  * @param {string} collectedItem - the collected item's name
  */
  function handleCollectedItem(collectedItem) {
    switch(collectedItem) {
      case 'gemGreen': GAME.money += 500; updateMoney(); break;
      case 'gemOrange': GAME.money += 800; updateMoney(); break;
      case 'gemBlue': GAME.money += 1000; updateMoney(); break;
      case 'heart': GAME.lives < 3 && (GAME.lives += 1); updateLives(); break;
      case 'key': GAME.player.hasKey = true; break;
      case 'star': GAME.player.isInvincible = true; handleInvincibility();
    }
  }
  /**
  * @description Handles the treasure opening
  * @param {object} treasure - the treasure to handle
  */
  function checkTreasure(treasure) {
    if(GAME.player.hasKey) {
      treasure.image = GAME.images.openedTreasure;
      treasure.class = 'openedTreasure', GAME.player.x -= GAME_SCREEN.cellWidth;
      setTimeout(function() {
        clearInterval(GAME.running), GAME_DOM['game-over'].classList.remove('hidden');
        GAME_DOM['game-message'].innerHTML = 'You Win!';
      }, 1000);
    }
    return true;
  }
  /**
  * @description Updates the money
  */
  function updateMoney() {
    GAME_DOM['player-money'].children[0].innerHTML = GAME.money;
  }
  /**
  * @description Updates the lives
  */
  function updateLives() {
    GAME_DOM['player-lives'].innerHTML = '<img src="img/heart.png">\n'.repeat(GAME.lives);
  }
  /**
  * @description handles loosing the game
  */
  function loseTheGame() {
    setInterval(function() {
      clearInterval(GAME.running), showElement(GAME_DOM['game-over']);
      GAME_DOM['game-message'].innerHTML = 'You lose';
    }, 100);
  }
  /**
  * @description Handles player's invincibility
  */
  function handleInvincibility() {
    GAME.player.class = 'superPlayer', GAME.player.image = GAME.images.superPlayer;
    setTimeout(function() {
      GAME.player.isInvincible = false, GAME.player.class = 'player';
      GAME.player.image = GAME.images.player;
    }, 3000);
  }
  /**
  * @description Handles game pause and resume
  */
  GAME.togglePause = function() {
    const PAUSE_BUTTON = GAME_DOM['icon-buttons'].children[0];
    !this.isPaused ? (clearInterval(this.running), this.isPaused = true,
    PAUSE_BUTTON.innerHTML = 'play_arrow') :
      (this.running = setInterval(runTheGame, 35), this.isPaused = false,
      PAUSE_BUTTON.innerHTML = 'pause');
  };
  /**
  * @description Handles game restarting
  */
  GAME.restart = function() {
    this.isPaused && GAME.togglePause();
    this.money = 0, this.lives = 3, this.level = 0;
    this.blocks.splice(0), this.createPlayGround();
    this.createUnits(), this.blocks.push(GAME.player), this.player.hasKey = false;
    this.player.isInvincible = false, this.player.class = 'player';
    this.player.image = GAME.images.player, this.player.resetPosition();
    GAME_DOM['player-level'].children[0].innerHTML = GAME.level + 1;
    updateMoney(), updateLives();
  };
  GAME.restart();
  /**
  * @description Handles running the game
  */
  function runTheGame() {
    GAME.blocks.forEach(function(block) {
      block.draw(), block.class.indexOf('nemy') > -1 && block.move();
    });
  }
  /**
  * @description Adds keyboard shotcuts to the game
  */
  document.body.onkeyup = function(e) {
    e.keyCode === 82 && GAME.restart();
    if(GAME.isPaused && e.keyCode === 80) {
      GAME.togglePause();
    }else {
      switch(e.keyCode) {
        case 37: case 38: case 39: case 40:
          GAME.player.move(GAME.controls[e.keyCode]); break;
        case 80: GAME.togglePause(); break;
      }
    }
  };

  GAME_DOM['game-over'].onclick = GAME_DOM['game-over'].ontouchstart = function(event) {
    event.target.nodeName === 'BUTTON' && (play(chosenPlayer), hideElement(this));
  };

  GAME_DOM['icon-buttons'].onclick = GAME_DOM['icon-buttons'].ontouchstart = function(event) {
    if(event.target.nodeName === 'BUTTON') {
      if(event.target.textContent === 'pause' ||
      event.target.textContent === 'play_arrow') {
        GAME.togglePause();
      }else if(event.target.textContent === 'refresh') {
        GAME.restart();
      }
    }
  };
  /**
  * window.ontouchstart, window.ontouchend, window.ontouchmove
  * @description Make the game playable on touch devices(smart phones, tablets...)
  */
  window.ontouchstart = function(e) {
    e.preventDefault();
    GAME.isDragging = true;
    GAME.clickPoints[0] = e.touches[0].screenX;
    GAME.clickPoints[1] = e.touches[0].screenY;
  };

  window.ontouchend = function(e) {
    e.preventDefault();
    GAME.isDragging = false;
  };

  window.ontouchmove = function(e) {
    e.preventDefault();
    if(!GAME.isDragging) {
      return;
    }
    let direction;
    if(e.touches[0].screenX - GAME.clickPoints[0] >= 50 &&
    e.touches[0].screenY - GAME.clickPoints[1] <= 25 &&
    e.touches[0].screenY - GAME.clickPoints[1] >= -25) {
      direction = 'right';
    }else if(GAME.clickPoints[0] - e.touches[0].screenX >= 50 &&
    e.touches[0].screenY - GAME.clickPoints[1] <= 25 &&
    e.touches[0].screenY - GAME.clickPoints[1] >= -25) {
      direction = 'left';
    }else if(e.touches[0].screenY - GAME.clickPoints[1] >= 50 &&
    e.touches[0].screenX - GAME.clickPoints[0] <= 25 &&
    e.touches[0].screenX - GAME.clickPoints[0] >= -25) {
      direction = 'down';
    }else if(GAME.clickPoints[1] - e.touches[0].screenY >= 50 &&
    e.touches[0].screenX - GAME.clickPoints[0] <= 25 &&
    e.touches[0].screenX - GAME.clickPoints[0] >= -25) {
      direction = 'up';
    }
    if(direction) {
      GAME.player.move(direction);
      GAME.isDragging = false;
    }
  };

  hideElement(GAME_DOM['player-selection']), hideElement(GAME_DOM['game-menu']);
}

GAME_DOM['game-menu'].onclick = function(event) {
  switch(event.target.textContent) {
    case 'Play': hideElement(GAME_DOM['game-menu']);
      showElement(GAME_DOM['player-selection']); break;
    case 'Game rules': showElement(GAME_DOM['game-rules']); break;
    case 'Controls': showElement(GAME_DOM['game-controls']);
  }
};

GAME_DOM['game-modal'].onclick = function(event) {
  event.target.className.indexOf('close-button') > -1 &&
    hideElement(event.target.parentElement);
};

GAME_DOM['player-selection'].onclick = function(event) {
  event.target.nodeName === 'IMG' && play(event.target.alt);
};
}());