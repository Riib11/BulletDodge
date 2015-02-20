var boundX = 1000;
var boundY = 800;

var game = new Phaser.Game(
	boundX,
	boundY,
	Phaser.CANVAS, 
	'game',
	{
		preload: preload,
		create: create,
		update: update,
		render: render 
	}
);

function preload() {
	game.load.image('player', 'assets/images/player_halfsize.png');
	game.load.image('bullet', 'assets/images/bullet.png');
	game.load.image('background', 'assets/images/grid_background.png');
	game.load.image('fireball', 'assets/images/fireball.png');
	game.load.spritesheet('explosion', 'https://raw.githubusercontent.com/jschomay/phaser-demo-game/master/assets/explode.png', 128, 128);
}

var bmd;
var lines;
var enableLines = false;

var player;
var speed = 500;
var health = 3;

var bullets;
var bulletSpeed = 700;
var bulletTime = 0;

var emitter;
var explosions;

var score = 0;
var scoreString;
var scoreText;

var livesString;
var livesText;

var loseText;

var pauseString;
var startString;
var pauseText;

var gameInProgress = false;
var gameIsPaused = false;

var cursors;

function create() {
	game.physics.startSystem(Phaser.Physics.ARCADE);

	// bmd
	bmd = game.add.bitmapData(boundX,boundY);
    bmd.ctx.strokeStyle = "red";

	// background
	game.add.tileSprite(0, 0, 1300, 1000, 'background');

	// bullets group
	bullets = game.add.group();
	bullets.enableBody = true;
	bullets.physicsBodyType = Phaser.Physics.ARCADE;
	bullets.createMultiple(30, 'bullet');
	bullets.setAll('anchor.x', 0.5)
	bullets.setAll('anchor.y', 1);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);

    // explosions
     //  An explosion pool
    explosions = game.add.group();
    explosions.enableBody = true;
    explosions.physicsBodyType = Phaser.Physics.ARCADE;
    explosions.createMultiple(30, 'explosion');
    explosions.setAll('anchor.x', 0.5);
    explosions.setAll('anchor.y', 0.5);
    explosions.forEach( function(explosion) {
        explosion.animations.add('explosion');
    });

    // explosions emitter
    emitter = game.add.emitter(0, 0, 100);
    emitter.makeParticles('fireball');
    emitter.gravity = 0;
    emitter.particleBringToTop = true;
    emitter.setXSpeed(-200,200);
    emitter.setYSpeed(-200,200);

    // player
    player = game.add.sprite(400,300,'player');
    player.anchor.setTo(0.5, 0.5);
    player.health = health;
    player.alive = true;
    game.physics.enable(player, Phaser.Physics.ARCADE);

    // score display
    score = 0;
	scoreString = 'Score: ';
	scoreText = game.add.text(10,10, scoreString + score, { font: '20px Arial', fill: '#000' });

    // player's life
    livesString = 'Lives: ';
    livesText = game.add.text(10,30, livesString + player.health, {font: '20px Arial', fill: '#0F0'});

	loseText = game.add.text(boundX / 2 - 200,boundY / 2 - 35, " ", { font: '70px Arial', fill: '#F00' });

    pauseString = "GAME PAUSED";
    startString = "CLICK TO START";
    pauseText = game.add.text(boundX / 2 - 200,boundY / 2 - 35, pauseString, { font: '70px Arial', fill: '#000' })

    game.scale.fullScreenScaleMode = Phaser.ScaleManager.NO_SCALE;

    cursors = game.input.keyboard.createCursorKeys();

    game.input.onDown.add(gofull, this);
}

// Paused: gameInProgress && gameIsPaused
// Ready to Start: !gameInProgress && player.isAlive
// Showing lose text: !gameInProgress && !player.isAlive

function gofull() {

    game.scale.startFullScreen();

    // Ready to Start: !gameInProgress && player.isAlive
    // starts game
    if(!gameInProgress && player.alive) {
        gameInProgress = true;
        gameIsPaused = false;
        player.alive = true;
        pauseText.visible = false;
        loseText.visible = false;
        player.health = health;
    }
    // Paused: gameInProgress && gameIsPaused
    // resumes game
    else if(gameInProgress && gameIsPaused) {
        gameInProgress = true;
        gameIsPaused = false;
        pauseText.visible = false;
    }
    // pauses game
    else if(gameInProgress && player.alive) {
        gameInProgress = true;
        gameIsPaused = true;     
    }
    // Showing Lose Text: !gameInProgress && !player.isAlive
    // shows start screen
    else if(!gameInProgress && !player.alive) {
        gameInProgress = false;
        player.revive();
        loseText.visible = false;
        player.reset(400,300);
    }
}

function update() {
    // Ready to Start: !gameInProgress && player.isAlive
    if(!gameInProgress && player.alive) {
        pauseText.visible = true;
        pauseText.text = startString;
        scoreText.x = 10;
        scoreText.y = 10;
        score = 0;
        return;
    }
    // Paused: gameInProgress && gameIsPaused
    else if(gameInProgress && gameIsPaused) {
        pauseText.visible = true;
        pauseText.text = pauseString;
        return;
    }
    // Showing Lose Text: !gameInProgress && !player.isAlive
    else if(!gameInProgress && !player.alive) {
        loseText.visible = true;
        return;
    }
	if(!player.alive) {
		loseText.text = "You Lose!";
		scoreText.x = boundX / 2 - 70;
		scoreText.y = boundY / 2 + 50;
        gameInProgress = false;
		return;
	}
	player.body.velocity.x = 0;
	player.body.velocity.y = 0;

	if(cursors.down.isDown) {
		player.body.velocity.y = speed;
	} else if(cursors.up.isDown) {
		player.body.velocity.y = -speed;
	} else if(cursors.right.isDown) {
		player.body.velocity.x = speed;
	} else if(cursors.left.isDown) {	
		player.body.velocity.x = -speed;
	}

	if(player.body.x < 0) {
		player.body.x = 0;
	} else if(player.body.x > boundX - player.body.width) {
		player.body.x = boundX - player.body.width;
	}

	if(player.body.y < 0) {
		player.body.y = 0;
	} else if(player.body.y > boundY - player.body.height) {
		player.body.y = boundY - player.body.height;
	}

	// Move bullets
	// bullets.forEach(game.physics.arcade.moveToObject, game.physics.arcade, false, player, 100);
	// moveToObject(displayObject, destination, [speed], [maxTime])

	game.physics.arcade.overlap(bullets, player, collisionHandler, null, this);

	if (game.time.now > bulletTime) {
		fireBullet();
	}

	score += game.time.elapsed;
	updateDisplayTexts();
}

function fireBullet() {
	bullet = bullets.getFirstExists(false);

    if (bullet) {
    	var side = Math.floor(Math.random()*(4) + 1)
    	var bX = 0;
    	var bY = 0;
    	var bVX = 0;
    	var bVY = 0;
    	var bAngle = 0;
    	var endLine = {
    		x: 0,
    		y: 0
    	};
    	switch(side) {
    		case 1:
    			bY = 5;
    			bX = Math.floor(Math.random()*((boundX - 10)-0+1))
    			bVY = bulletSpeed;
    			bAngle = 90;
    			endLine.x = bX;
    			endLine.y = boundY;
    			break;
    		case 2:
    			bX = boundX - 10;
    			bY = Math.floor(Math.random()*((boundY - 10)-0+1))
    			bVX = -bulletSpeed;
    			bAngle = 180;
    			endLine.x = 0;
    			endLine.y = bY;
    			break;
    		case 3:
    			bX = Math.floor(Math.random()*((boundX - 10)-0+1))
    			bY = boundY - 10;
    			bVY = -bulletSpeed;
    			bAngle = -90;
    			endLine.x = bX;
    			endLine.y = 0;
    			break;
    		case 4:
    			bX = 5;
    			bY = Math.floor(Math.random()*((boundY - 10)-0+1))
    			bVX = bulletSpeed;
    			bAngle = 0;
    			endLine.x = boundX;
    			endLine.y = bY;
    			break;
    	}
        bullet.reset(bX, bY);
        bullet.body.velocity.x = bVX;
        bullet.body.velocity.y = bVY;
        bullet.angle = bAngle;
        bulletTime = game.time.now + 100;

        if(enableLines) {
        	// console.log(bX + bY)
        	bmd.ctx.beginPath();
	    	bmd.ctx.moveTo(bX,bY);
	    	bmd.ctx.lineTo(endLine.x,endLine.y);
	    	bmd.ctx.closePath();
	    	bmd.ctx.stroke();
	    	bmd.dirty = true;
	    	game.add.sprite(0,0,bmd)
        }

    }
}

function emitExplosion(player) {
	emitter.x = player.x;
	emitter.y = player.y;
    if(player.alive) emitter.start(true, 3000, null, 10);
    else {
        emitter.setXSpeed(-100,100);
        emitter.setYSpeed(-100,100);
        emitter.start(false, 5000, 5, 100);
        // start(explode, lifespan, frequency, quantity, forceQuantity)
    }
}

function explode(player) {
	var explosion = explosions.getFirstExists(false);
    explosion.reset(player.body.x + player.body.halfWidth, player.body.y + player.body.halfHeight);
    explosion.body.velocity.y = player.body.velocity.y;
    explosion.body.velocity.x = player.body.velocity.x;
    explosion.alpha = 0.7;
    explosion.play('explosion', 30, false, true);
    if(!player.alive) {
        var position = {
            x: player.body.x + player.body.halfWidth,
            y: player.body.y + player.body.halfHeight
        }
        for(x = -4; x <= 4; x++) {
            for(y = -4; y <= 4; y++) {
                explosion.reset(position.x + (5*x),position.y + (5*y));
                explosion.play('explosion', 30, false, true);
            }
        }
    }
}

function updateDisplayTexts() {
	scoreText.text = scoreString + Math.floor(score/1000);
    if(player.health == 1) livesText.addColor('red',0);
    else livesText.addColor('black',0);
    livesText.text = livesString + player.health;
}

function collisionHandler(player, bullet) {
	player.damage(1);
    bullet.kill();
	// bullet.reset(0,0);
	emitExplosion(player);
	explode(player);
}

function render() {

}