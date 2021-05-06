function divide(){ // This function returns the directions array according to the base speed and number of directions 
    var board = [];
    var division = Math.trunc(BASE_SPEED/BOARD_DIRECTIONS);
    for (let g=1; g<(BOARD_DIRECTIONS); g++){
        board.push([-1*(BASE_SPEED-division*g),-1*division*g]);
    }
    for (let f=1; f<(BOARD_DIRECTIONS); f++){
        board.push([Math.trunc(BASE_SPEED/BOARD_DIRECTIONS)*f,-1*(BASE_SPEED-Math.trunc(BASE_SPEED/BOARD_DIRECTIONS)*f)]);
    }
    board.splice(0,2);
    board.splice(board.length-2,2);
    return board;
}
var BACKGROUND_IMAGE = "media/galaxy.jpg"; // Background Image
var BALL_COLOR = "white"; // Color of the ball
var BALL_RADIUS = 10; // Radius of the ball
var BALL_SOUND = "media/lilo.wav"; // Sound the ball makes when it collides
var BASE_SPEED = 25;
var BLOCK_COLOR = "#d6381c"; // Color of the bricks
var BLOCK_HEIGHT = 20; // Height of the bricks
var BLOCK_WIDTH = 50; // Width of the bricks
var BLOCK_X_SPACE = 30; // Space between bricks on the x axis
var BLOCK_Y_SPACE = 20; // Space between bricks on the y axis
var BOARD_COLOR = "white"; // Color of the game board
var BOARD_DIRECTIONS = 25;
var BOARD_IMPACT_COLOR = "blue"; // Color of the game board after collision with diamond
var BOARD_LONG = 150; // Width of the game board
var BOARD_SPEED_X = 30; // Speed of the board
var BOARD_THICC = 10; // Height of the board
var BOARD_Y_LEVEL = 650; // Position of the board on the Y Axis
var CANVAS_HEIGHT = 700; // Height of the canvas
var CANVAS_WIDTH = 1000; // Width of the canvas
var DIRECTIONS = divide(); // Array of directions, a direction is an array of speeds on the X and Y axis (ex : [-10,20])
var EXPLOSION_DURATION = 50; // Number of updates where explosion is drawn 
var EXPLOSION_IMAGE = "media/poof.png"; // Image of the explosion
var EXPLOSION_INIT_SIZE = 30; // Initial size of the explosion
var EXPLOSION_SOUND = "media/boom.wav"; // Sound of the explosion
var FALL_SOUND = "media/fall.wav"; // Sound of falling ball
var GAME_SIZE = 1500;
var GAME_Y = 50;
var GRID_X = 10; // Number of blocks on the X axis
var GRID_Y = 5; // Number of blocks on the Y axis
var INIT_SPEEDX = -10; // Initial speed on the X axis of the original ball
var INIT_SPEEDY = -20; // Initial speed on the Y axis of the original ball
var LAUNCH = 32; // Key code to launch ball
var LEFT = 37; // Key code to move game board to the left
var LIFE_NUMBER = 3; // Number of tries 
var LIFE_IMAGE = "media/spaceship.png"; // Image to represent a try
var LIFE_WIDTH = 30; // Width of the image above
var LIFE_HEIGHT = 30; // Height of the image above
var LIFE_SPACE_X = 10; // Space between images of tries
var LIFE_Y = 10; // Y level of try image
var PATH_COLORS = ["yellow","orange","red"]; // Colors of the animation behind a moving ball
var PRESENT_BALL_SPEEDX = 0; // Initial speed on the X axis of a present ball
var PRESENT_BALL_SPEEDY = 15; // Initial speed on the Y axis of a present ball
var PRESENT_CHANCE_ONE = 0.4;
var PRESENT_CHANCE_TWO = 0.4;
var PRESENT_CHANCE_THREE = 0.2;
var PRESENT_DURATION = 20; // Duration of the change of color of the board after catching a present 
var PRESENT_IMAGE = ["media/diam.png","media/diamred.png","media/diamyellow.png"]; // Images of presents
var PRESENT_SOUND = ["media/jump.wav","media/damage.wav","media/levelup.wav"]; // Sounds of catching presents
var PRESENT_SPEED = 10; // Speed on the Y axis of presents 
var PRESENT_X = 30; // Width of present image
var PRESENT_Y = 30; // Height of present image
var PROTECC_COLOR = "white"; // Color of the shield around blocks
var PROTECC_SUPPORT_COLOR = "black"; // Color of the drawn lines on the shields
var PROTECC_THICC = 5; // Thiccness of the shields 
var RIGHT = 39; // Key code to move board to the right
var SCORE_COLOR = "white";
var paper; // Wallpaper object, draws the background image of the game
var pad; // Board object
var bricks; // Group of blocks
var present_ball_array; // Group of balls
var score = 0;
var gamestate = 0;
var bonus = 0;
var myGameArea = { // Canvas object with the start function (keyboard listeners, time interval canvas update) and clear canvas function 
    canvas : document.createElement("canvas"),
    start : function(){
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(updateGameArea, 20);
        window.addEventListener('keydown', function (e) {
            myGameArea.keys = (myGameArea.keys || []);
            myGameArea.keys[e.keyCode] = (e.type == "keydown");
        })
        window.addEventListener('keyup', function (e) {
            myGameArea.keys[e.keyCode] = (e.type == "keydown");
        })
    },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}
function heart(){ // Object to draw number of tries left
    this.image = new Image();
    this.image.src = LIFE_IMAGE;
    this.update = function(){
        ctx = myGameArea.context;
        for(let n=0;n<lives;n++){
            ctx.drawImage(this.image,(LIFE_SPACE_X+LIFE_WIDTH)*n,LIFE_Y,LIFE_WIDTH,LIFE_HEIGHT);
        }
    }
}
function ball(radius,x,y,board,blocklist,inits,mode,wallpaper){ // Object to draw ball with sound effects
    this.gamearea = myGameArea;
    this.radius = radius;
    this.x = x;
    this.y = y;
    this.speedX = inits[0];
    this.speedY = inits[1];
    this.board = board;
    this.start = 0; // 0 before launch and 1 after launch of ball
    this.blocklist = blocklist;
    this.mode = mode; // 0 original ball and 1 present ball (used so that the present ball on the intial fall dont interact with the blocks)
    this.path = new path(this); 
    this.heart = new heart();
    this.explosion = 0; // 0 no explosion and 1 explosion starts
    this.explosionx = 0; // Position of the explosion
    this.explosiony = 0;
    this.explosionimage = new Image();
    this.explosionimage.src = EXPLOSION_IMAGE; 
    this.bopsound = new Sound(BALL_SOUND);
    this.explosionsound = new Sound(EXPLOSION_SOUND);
    this.boardx = 0; // Position of the ball on the board
    this.fallsound = new Sound(FALL_SOUND);
    this.wallpaper = wallpaper;
    this.update = function(){
        if ((this.explosion > 0)&&(this.explosion < EXPLOSION_DURATION)){
            this.explosion += 1;
            this.explosionx -= 1;
            this.explosiony -= 1;
            ctx.drawImage(this.explosionimage,this.explosionx,this.explosiony,EXPLOSION_INIT_SIZE+this.explosion,this.explosion+EXPLOSION_INIT_SIZE);
        } else if (this.explosion >=100){
            this.explosion = 0;
            this.explosionx = 0;
            this.explosiony = 0;
        }
        this.heart.update();
        if((this.start === 1)&&(this.y<(CANVAS_HEIGHT-this.radius))){
            this.path.update(); // draws animation behind ball
        }
        ctx = myGameArea.context;
        ctx.fillStyle = BALL_COLOR;
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.radius,0,2*Math.PI,true);
        ctx.closePath();
        ctx.fill();
        if (myGameArea.keys && myGameArea.keys[LAUNCH] && this.start === 0) {
            this.start = 1;
        }
        if(this.start === 0){
            this.x = this.board.x + (BOARD_LONG/2);
            this.y = this.board.y - BALL_RADIUS;
        } else {
            this.newPos();
        }
    }
    this.newPos = function(){
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x >= CANVAS_WIDTH-BALL_RADIUS){ // Collision
            this.bopsound.play();
            this.x = CANVAS_WIDTH-BALL_RADIUS;
            this.speedX *= -1;
        }
        if (this.x <= BALL_RADIUS){ // Collision
            this.bopsound.play();
            this.x = BALL_RADIUS;
            this.speedX *= -1;
        }
        if (this.y <= BALL_RADIUS) { // Collision
            this.bopsound.play();
            this.speedY *= -1;
        }
        if (((this.y >= BOARD_Y_LEVEL-2*BALL_RADIUS)&&(this.y <= BOARD_Y_LEVEL))&&((this.x > this.board.x)&&(this.x < this.board.x + BOARD_LONG))) { // Collision with the board
            this.bopsound.play();
            this.y = BOARD_Y_LEVEL-BALL_RADIUS;
            this.boardx = Math.trunc((this.x - this.board.x)/(Math.trunc(BOARD_LONG/DIRECTIONS.length))); // Board is divided into x parts (x length of directions array) 
            if(this.boardx < DIRECTIONS.length) {
                this.speedX = DIRECTIONS[this.boardx][0];
                this.speedY = DIRECTIONS[this.boardx][1];
            } else {
                this.speedX = DIRECTIONS[DIRECTIONS.length-1][0];
                this.speedY = DIRECTIONS[DIRECTIONS.length-1][1];
            } 
            if(this.mode === 1){ // If falling present ball hits board, turn it to normal ball
                this.mode = 0;
            }
        }
        if (this.y > (CANVAS_HEIGHT-BALL_RADIUS)) { // If ball isnt caught by the board
            if(present_ball_array.length === 1){ // If player has only one ball, play explosion and remove try. If no tries left player loses
                this.explosionsound.play();
                this.explosion = 1;
                this.explosiony = parseInt(this.y) + BALL_RADIUS - EXPLOSION_INIT_SIZE;
                this.explosionx = parseInt(this.x) - EXPLOSION_INIT_SIZE/2;
                this.y = CANVAS_HEIGHT-BALL_RADIUS;
                this.speedX = 0;
                this.speedY = 0;
                this.start = 0;
                lives -= 1;
                if(lives === 0){
                    gamestate = 1;
                    ala.startanim = 1;
                    bonus = GRID_X*GRID_Y - this.blocklist.blockarray.length; 
                }
            } else { // If player has more than 1 ball, play falling sound 
                present_ball_array.splice(present_ball_array.indexOf(this),1);
                this.fallsound.play();
            }
        }      
        if (this.mode === 0) { // If ball is not falling present ball, Ball interacts with blocks
            for(let i=0; i<this.blocklist.blockarray.length; i++){
                if(this.blocklist.blockarray[i].inside(this.x+this.speedX,this.y+this.speedY)){ // If in the next move the ball will be inside a block start collision treatment
                    this.bopsound.play();
                    this.blocklist.blockarray[i].hit -= 1;
                    if(this.blocklist.blockarray[i].hit === 0){ // If block is destroyed, present will fall and if block contains a ball the present ball will fall 
                        blocklist.presentarray.push(new present(this.blocklist.blockarray[i].x+(this.blocklist.blockarray[i].width/2),this.blocklist.blockarray[i].y+(this.blocklist.blockarray[i].height/2),PRESENT_X,PRESENT_Y,PRESENT_SPEED,this.board,this.wallpaper));
                        if(this.blocklist.blockarray[i].lucky === 1){
                            var presentball = new ball(BALL_RADIUS,this.blocklist.blockarray[i].x+BLOCK_WIDTH/2,this.blocklist.blockarray[i].y+BLOCK_HEIGHT/2,this.board,this.blocklist,[PRESENT_BALL_SPEEDX,PRESENT_BALL_SPEEDY],1,this.wallpaper);
                            presentball.start = 1;
                            present_ball_array.push(presentball);
                        }
                    }
                    if(this.x<this.blocklist.blockarray[i].x){
                        this.speedX *= -1;
                    }
                    if(this.x>this.blocklist.blockarray[i].x+this.blocklist.blockarray[i].width){
                        this.speedX *= -1;
                    }
                    if(this.y<this.blocklist.blockarray[i].y){
                        this.speedY *= -1;
                    }
                    if(this.y>this.blocklist.blockarray[i].y+this.blocklist.blockarray[i].height){
                        this.speedY *= -1;
                    }
                }
            }
        } 
    }        
}
function block(x,y,width,height,lucky){ // Block object
    this.gamearea = myGameArea;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.hit = 2;
    this.lucky = lucky; // If block contains present ball
    this.update = function(){
        if (this.hit>0){
            ctx = myGameArea.context;
            ctx.fillStyle = BLOCK_COLOR;
            ctx.fillRect(this.x,this.y,this.width,this.height);
        } 
    }
    this.inside = function(ballx,bally){ // If in the next move the ball will be inside the block
        if (((ballx>this.x-BALL_RADIUS)&&(ballx<this.x+this.width+BALL_RADIUS))&&((bally>this.y-BALL_RADIUS)&&(bally<this.y+this.height+BALL_RADIUS))){
            return true;
        } else {
            return false;
        }
    }
}
function protection(shape){ // for drawing the shields around the blocks
    this.gamearea = myGameArea;
    this.shape = shape;
    this.update = function(){
        for(let m=0; m<this.shape.blockarray.length; m++){
            ctx = myGameArea.context;
            if(this.shape.blockarray[m].hit === 2){
                ctx.fillStyle = PROTECC_COLOR;
                ctx.fillRect(this.shape.blockarray[m].x-PROTECC_THICC,this.shape.blockarray[m].y-PROTECC_THICC,this.shape.blockarray[m].width+2*PROTECC_THICC,this.shape.blockarray[m].height+2*PROTECC_THICC);
                ctx.beginPath();
                ctx.strokeStyle = PROTECC_SUPPORT_COLOR;
                ctx.moveTo(this.shape.blockarray[m].x,this.shape.blockarray[m].y);
                ctx.lineTo(this.shape.blockarray[m].x-PROTECC_THICC,this.shape.blockarray[m].y-PROTECC_THICC);
                ctx.closePath();
                ctx.stroke()
                ctx.beginPath();
                ctx.strokeStyle = PROTECC_SUPPORT_COLOR;
                ctx.moveTo(this.shape.blockarray[m].x+this.shape.blockarray[m].width,this.shape.blockarray[m].y);
                ctx.lineTo(this.shape.blockarray[m].x+this.shape.blockarray[m].width+PROTECC_THICC,this.shape.blockarray[m].y-PROTECC_THICC);
                ctx.closePath();
                ctx.stroke()
                ctx.beginPath();
                ctx.strokeStyle = PROTECC_SUPPORT_COLOR;
                ctx.moveTo(this.shape.blockarray[m].x,this.shape.blockarray[m].y+this.shape.blockarray[m].height);
                ctx.lineTo(this.shape.blockarray[m].x-PROTECC_THICC,this.shape.blockarray[m].y+this.shape.blockarray[m].height+PROTECC_THICC);
                ctx.closePath();
                ctx.stroke()
                ctx.beginPath();
                ctx.strokeStyle = PROTECC_SUPPORT_COLOR;
                ctx.moveTo(this.shape.blockarray[m].x+this.shape.blockarray[m].width,this.shape.blockarray[m].y+this.shape.blockarray[m].height);
                ctx.lineTo(this.shape.blockarray[m].x+this.shape.blockarray[m].width+PROTECC_THICC,this.shape.blockarray[m].y+this.shape.blockarray[m].height+PROTECC_THICC);
                ctx.closePath();
                ctx.stroke()
            }
        }
    }
}
function blockshape(x,y,type,wallpaper){ // Group of blocks on the screen 
    this.gamearea = myGameArea;
    this.x = x;
    this.y = y;
    this.type = type;
    this.blockarray = [];
    this.protection = new protection(this);
    this.presentarray = [];
    if(this.type === 1){
        for(let i=0;  i<GRID_X; i++){
            for(let j=0; j<GRID_Y; j++){
                if(Math.random() > 0.1){ // Based a random number, the block has a present ball that fall upon impact 
                    this.blockarray.push(new block(this.x+i*(BLOCK_WIDTH+BLOCK_X_SPACE),this.y+j*(BLOCK_HEIGHT+BLOCK_Y_SPACE),BLOCK_WIDTH,BLOCK_HEIGHT,0));
                } else {
                    this.blockarray.push(new block(this.x+i*(BLOCK_WIDTH+BLOCK_X_SPACE),this.y+j*(BLOCK_HEIGHT+BLOCK_Y_SPACE),BLOCK_WIDTH,BLOCK_HEIGHT,1));
                }
            }
        }
    }
    this.update = function(){
        this.protection.update();
        for(let k=0; k<this.blockarray.length; k++){
            if (this.blockarray[k].hit>0){
                this.blockarray[k].update();
            } else {
                this.blockarray.splice(k,1);
                if(this.blockarray.length === 0){ // Means no more blocks on screen so game over, we calculate the final score 
                    gamestate = 1;
                    ala.startanim = 1;
                    bonus = lives*lives + GRID_X*GRID_Y;
                }
            }
        } 
        for(let p=0; p<this.presentarray.length; p++){
            if (this.presentarray[p].state === 0){
                this.presentarray[p].update();
            }
        }    
    }
}
function present(x,y,width,height,speedY,board,wallpaper){ // the presents that falls from the blocks
    this.gamearea = myGameArea;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speedY = speedY;
    this.board = board;
    this.state = 0;
    this.image = new Image();
    this.wallpaper = wallpaper;
    var a  = Math.random();
    if(a<PRESENT_CHANCE_ONE){ // Depending on the random number a we determine the type of present 
        this.image.src = PRESENT_IMAGE[1];
        this.sound = new Sound(PRESENT_SOUND[1]);
        this.wallpaper.color = "#f2053c";
    } else if (a>=PRESENT_CHANCE_ONE && a<PRESENT_CHANCE_THREE+PRESENT_CHANCE_ONE){
        this.image.src = PRESENT_IMAGE[2];
        this.sound = new Sound(PRESENT_SOUND[2]);
        this.wallpaper.color = "#05f24c";
    } else {
        this.image.src = PRESENT_IMAGE[0];
        this.sound = new Sound(PRESENT_SOUND[0]);
        this.wallpaper.color = "#00ede9";
    }
    this.update = function(){
        ctx = myGameArea.context;
        ctx.drawImage(this.image,this.x,this.y,this.width,this.height);
        if(this.y < CANVAS_HEIGHT){
            this.y += this.speedY;
            if(((this.y>(BOARD_Y_LEVEL-2*PRESENT_SPEED))&&(this.y<BOARD_Y_LEVEL))&&((this.x>this.board.x)&&(this.x<this.board.x+this.board.width))){ // when the present hits the board we update the score and change the boards color temporarily
                this.state = 1;
                this.board.eatanim += PRESENT_DURATION;
                if (this.image.src.includes(PRESENT_IMAGE[0])) {
                    this.board.color = "#00ede9";
                    score += 1;
                    this.wallpaper.scoresize += 20;
                } else if (this.image.src.includes(PRESENT_IMAGE[1])){
                    this.board.color = "#f2053c";
                    score -= 1;
                    this.wallpaper.scoresize -= 20;
                } else {
                    this.board.color = "#05f24c";
                    score += 2;
                    this.wallpaper.scoresize += 40;
                }
                this.sound.play();
            }
        } else {
            this.state = 1;
        }
    }
}
function board(x,y,width,height){
    this.gamearea = myGameArea;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.eatanim = 0;
    this.color = "";
    this.update = function(){
        ctx = myGameArea.context;
        if (this.eatanim === 0){
            ctx.fillStyle = BOARD_COLOR;
        } else {
            ctx.fillStyle = this.color;
            this.eatanim -= 1;
        }
        ctx.fillRect(this.x,this.y,this.width,this.height);
        if (myGameArea.keys && myGameArea.keys[LEFT]) {
            if(this.x>0){
                if (this.x - BOARD_SPEED_X < 0){
                    this.x = 0;
                } else {
                    this.x -= BOARD_SPEED_X;
                }
            }
        }
        if (myGameArea.keys && myGameArea.keys[RIGHT]) {
            if(this.x<(CANVAS_WIDTH-BOARD_LONG)){
                if (this.x+BOARD_SPEED_X > CANVAS_WIDTH-BOARD_LONG){
                    this.x = CANVAS_WIDTH-BOARD_LONG
                } else {
                    this.x += BOARD_SPEED_X;
                }
            }
        }
    }
}
function path(ball){
    this.gamearea = myGameArea;
    this.ball = ball;
    this.update = function(){
        ctx = myGameArea.context;
        ctx.fillStyle = PATH_COLORS[0];
        ctx.moveTo(this.ball.x+(BALL_RADIUS*4)/5,this.ball.y-(BALL_RADIUS*4)/5)
        ctx.lineTo(this.ball.x-(BALL_RADIUS*4)/5,this.ball.y+(BALL_RADIUS*4)/5);
        ctx.lineTo(this.ball.x-3*this.ball.speedX,this.ball.y-3*this.ball.speedY);
        ctx.fill();
        ctx.closePath();
        ctx.beginPath();
        ctx.fillStyle = PATH_COLORS[1];
        ctx.moveTo(this.ball.x+(BALL_RADIUS*4)/5,this.ball.y-(BALL_RADIUS*4)/5);
        ctx.lineTo(this.ball.x-(BALL_RADIUS*4)/5,this.ball.y+(BALL_RADIUS*4)/5);
        ctx.lineTo(this.ball.x-2*this.ball.speedX,this.ball.y-2*this.ball.speedY);
        ctx.fill();
        ctx.closePath();
        ctx.beginPath();
        ctx.fillStyle = PATH_COLORS[2];
        ctx.moveTo(this.ball.x+(BALL_RADIUS*4)/5,this.ball.y-(BALL_RADIUS*4)/5)
        ctx.lineTo(this.ball.x-(BALL_RADIUS*4)/5,this.ball.y+(BALL_RADIUS*4)/5);
        ctx.lineTo(this.ball.x-this.ball.speedX,this.ball.y-this.ball.speedY);
        ctx.fill();
        ctx.closePath();
        ctx.beginPath();
    }
}
function background(source){
    this.gamearea = myGameArea;
    this.image = new Image();
    this.image.src = source;
    this.scoresize = 0;
    this.color = "white";
    this.bonuscolor = "white";
    this.bonusanim = 0;
    this.looper = 0;
    this.sound = new Sound(PRESENT_SOUND[0]);
    this.update = function(){
        console.log(this.color);
        if(this.scoresize > 0){
            this.scoresize -= 1;
            this.color = "#05f24c";
        } else if (this.scoresize < 0){
            this.scoresize += 1;
            this.color = "#f2053c";
        } else {
            this.color = "white";
        }
        ctx = myGameArea.context;
        ctx.drawImage(this.image,0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
        if (this.bonusanim < bonus) {
            this.color = "#05f24c";
            if (this.looper === 0) {
                this.bonusanim += 1;
                this.looper += 3;
                this.sound.play();
            }
        } else if (this.bonusanim == bonus) {
            this.color = "white";
        }
        if (this.looper > 0){
            this.looper -= 1;
        } 
        ctx.fillStyle = this.color;
        ctx.font = String(50+this.scoresize+this.looper*10)+"px Arial";
        ctx.fillText(score+this.bonusanim, 14*CANVAS_WIDTH/15, CANVAS_HEIGHT/12);
    }
}
function initiate(){ // Function that initiates the main game objects (ball, board, blocks and wallpaper)
    present_ball_array = [];
    score = 0;
    lives = LIFE_NUMBER;
    paper = new background(BACKGROUND_IMAGE);
    pad = new board(((CANVAS_WIDTH/2)-(BOARD_LONG/2)),BOARD_Y_LEVEL,BOARD_LONG,BOARD_THICC);
    bricks = new blockshape((CANVAS_WIDTH-((BLOCK_WIDTH+BLOCK_X_SPACE)*GRID_X-BLOCK_X_SPACE))/2,GAME_Y,1);
    present_ball_array.push(new ball(BALL_RADIUS,0,0,pad,bricks,[INIT_SPEEDX,INIT_SPEEDY],0,paper));
    ala = new alphabet("GAME OVER");
}
function durgame(){
    myGameArea.clear();
    paper.update();
    pad.update();
    bricks.update();
    for(let q=0; q<present_ball_array.length; q++){
        present_ball_array[q].update();
    }
}
function afgame(){
    myGameArea.clear();
    paper.update();
    pad.update();
    bricks.update();
    present_ball_array[0].heart.update();
    ala.update();
}
function alphabet(string){
    this.startanim = 0;
    this.x = 0;
    this.letter = 0;
    this.shown = "";
    this.update = function() {
        ctx.fillStyle = "#fd4f58";
        ctx.font = "100px Arial";
        if (this.startanim === 1){
            if (this.letter < string.length) {
                if (this.x < 220){
                    ctx.fillText(string[this.letter],this.x,325);
                    this.x += 30;
                } else {
                    this.shown += string[this.letter];
                    this.letter += 1;
                    this.x = 0;
                    this.sound.play();
                }
            } else {
                this.startanim = 0;
            }
        }
        ctx.fillStyle = "#fd4f58";
        ctx.font = "100px Candara";
        ctx.fillText(this.shown,220,325);
    }
}
function updateGameArea(){
    if (gamestate === 0){
        durgame();
    } else {
        afgame();
    }    
}
function Sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
        this.sound.play();
    }
    this.stop = function(){
        this.sound.pause();
    }
}