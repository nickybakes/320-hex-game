"use strict";
const app = new PIXI.Application({
    width: 1024,
    height: 576,
    antialias: true
});
document.body.appendChild(app.view);

//resolution of the entire canvas area
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;

//time taken to calculate/render this frame
let frameTime;

//the stage we are rendering everything to
let stage;

//all the HUDs for each game state
let titleScene;
let howToPlayScene;
let modeScene;
let gameScene;
let pauseScene;
let endGameScene;
let scenes = [];

// As close to an enum as we're gonna get with no TypeScript :(
const titleState = 0;
const howToPlayState = 1;
const modeState = 2;
const gameState = 3;
const pauseState = 4;
const endGameState = 5;

// Stores data for the current state of the game
let currentState = 0;

const timedMode = 0;
const endlessMode = 1;

let currentMode;

//Key names for local storage
const prefix = "nmb9745-";
const carColorKey = prefix + "carColor";

//variables needed to run the game
let hexRadius = 50;
let hexArray = [];
let destroyedHexArray = [];
let hexGridHeight = 6;
let hexGridWidth = 6 * 2;
let hexPath = [];

let highlightedHex;
let dragStartHex;
let pathIndicator;

//true if we should visually connect the white line to the start of the hex path
let connectPathToStart;

let hexGridDisplayX = 100;
let hexGridDisplayY = 100;

let rotationCoolDown;
let rotationCoolDownMax = .2;

// timer variables
let startTimeInSec = 30;
let currentTimeInSec = startTimeInSec;
let gameStarted = false;
let timeTracker = new PIXI.Text('timer', {fill: 0xffffff});
timeTracker.x = 900;

let score = 0;
let scoreString = 'score: ';
let scoreTracker = new PIXI.Text('score: ' + score, {fill: 0xffffff});
//timeTracker.x = 800;
//timeTracker.y = 200;

//time during falling animation of hexes falling 1 row,
//set to -1 if no longer falling at all
let hexFallAnimationTime;
let hexFallAnimationTimeMax = .3;

let hexBreakAnimationTime;
let hexBreakAnimationTimeMax = .4;
let hexBreakAnimationTimePerHex;
let hexBreakAnimationTimeMaxPerHex;

let hexBreakParticles = [];

let wrongMoveIndicator;
let wrongMovePositionAndDirection;

//the amount of hexes waiting above row 0 in each column, 
//waiting to be dropped into the playable board
let columnWaitAmount = [];

let displacementSprite;
let displacementFilter;
let bloomFilter;

//objects that store the states of user's input/controls
let mousePosition;
let mouseHeldDown;
let keysHeld = [];
let keysReleased = [];

//once finished, call the setUpGame function
app.loader.onComplete.add(setupScenes);
app.loader.load();

// Initializing the game's scenes- This should always be the first setup function called
function setupScenes() {
    //set up our scenes/containers
    stage = app.stage;

    //init our HUD containers for different game states
    titleScene = new PIXI.Container();
    howToPlayScene = new PIXI.Container();
    modeScene = new PIXI.Container();
    gameScene = new PIXI.Container();
    pauseScene = new PIXI.Container();
    endGameScene = new PIXI.Container();

    //store our scenes for easy access later
    
    setUpTitle();
    setupHowToPlay();
    setUpMode();
    setUpGame();
    setUpPause();
    setUpEnd();
    scenes = [titleScene, howToPlayScene, modeScene, gameScene, pauseScene, endGameScene];

    //our game state starts at 0 (title screen)
    setGameState(0);
}

// Initialization for the Title screen
function setUpTitle() {
    let buttonStyle = new PIXI.TextStyle({
        fill: 0xffeb0b,
        fontSize: 60,
        fontFamily: "Amaranth",
        dropShadow: true,
        dropShadowAlpha: 1,
        dropShadowBlur: 5,
        dropShadowDistance: 1
    });

    // This stuff has hardcoded locations, which I need to fix later

    // Adding a stage background
    titleScene.addChild(createSprite('../media/background-panel.jpg', 0.5, 0.5, 512, 288));

    // Creating the logo
    let logo = createSprite('../media/main-logo.png', 0, 0, 120, 50);
    logo.width = 500;
    logo.height = 80;
    titleScene.addChild(logo);

    // Creating the buttons
    let playButton = createStateButton("PLAY", 300, 220, howToPlayState, buttonStyle);
    titleScene.addChild(playButton);
    // let howToPlayButton = createStateButton("How To Play", 75, 240, 1, buttonStyle);
    // titleScene.addChild(howToPlayButton);

    app.stage.addChild(titleScene);

}

// Inits the tutorial
function setupHowToPlay() {
    //add our window keyboard listener
    window.addEventListener("keydown", keysDown);
    window.addEventListener("keyup", keysUp);

    // Adding a stage background
    howToPlayScene.addChild(createSprite('../media/background-panel.jpg', 0.5, 0.5, 512, 288));

    // Creating the logo
    let logo = createSprite('../media/how-to-play-logo.png', 0, 0, 170, 50);
    logo.width = 400;
    logo.height = 80;
    howToPlayScene.addChild(logo);

    let buttonStyle = new PIXI.TextStyle({
        fill: 0xffeb0b,
        fontSize: 48,
        fontFamily: "Amaranth",
        dropShadow: true,
        dropShadowAlpha: 1,
        dropShadowBlur: 5,
        dropShadowDistance: 1
    });

    let textStyle = new PIXI.TextStyle({
        fill: 0x000000,
        fontSize: 24,
        fontFamily: "Amaranth",
    });

    howToPlayScene.addChild(createText("Drag your mouse between segments of the same color to", 75, 150, textStyle));
    howToPlayScene.addChild(createText("make a match! You can also press Q and E to rotate hexes.", 75, 170, textStyle));
    howToPlayScene.addChild(createText("Make bigger matches for better scores. You can also draw", 75, 210, textStyle));
    howToPlayScene.addChild(createText("certain patterns for unique effects!", 75, 230, textStyle));

    // Creating the buttons
    let playButton = createStateButton("Back to Menu", 75, 500, titleState, buttonStyle);
    howToPlayScene.addChild(playButton);
    let modeButton = createStateButton("[TEMP] Mode", 200, 500, modeState, buttonStyle);
    howToPlayScene.addChild(modeButton);

    howToPlayScene.addChild(new Hexagon(getScreenSpaceX(3), getScreenSpaceY(3), 3, 3, hexRadius, Math.trunc(Math.random() * 6), null, null));
    howToPlayScene.addChild(new Hexagon(getScreenSpaceX(5), getScreenSpaceY(3), 5, 3, hexRadius, Math.trunc(Math.random() * 6), null, null));
    howToPlayScene.addChild(new Hexagon(getScreenSpaceX(7), getScreenSpaceY(3), 5, 3, hexRadius, Math.trunc(Math.random() * 6), null, null));
    howToPlayScene.addChild(new Hexagon(getScreenSpaceX(4), getScreenSpaceY(4), 3, 3, hexRadius, Math.trunc(Math.random() * 6), null, null));
    howToPlayScene.addChild(new Hexagon(getScreenSpaceX(6), getScreenSpaceY(4), 5, 3, hexRadius, Math.trunc(Math.random() * 6), null, null));

    app.stage.addChild(howToPlayScene);
}

// Initialization for the Mode screen
function setUpMode() {
    let buttonStyle = new PIXI.TextStyle({
        fill: 0xffeb0b,
        fontSize: 60,
        fontFamily: "Amaranth",
        dropShadow: true,
        dropShadowAlpha: 1,
        dropShadowBlur: 5,
        dropShadowDistance: 1
    });

    // This stuff has hardcoded locations, which I need to fix later

    // Adding a stage background
    modeScene.addChild(createSprite('../media/background-panel.jpg', 0.5, 0.5, 512, 288));

    // Creating the logo
    let logo = createSprite('../media/mode-logo.png', 0, 0, 120, 50);
    logo.width = 500;
    logo.height = 80;
    modeScene.addChild(logo);

    // Creating the buttons
    let playTimedButton = createStateButton("TIMED", 300, 220, gameState, buttonStyle);
    // tweak the state button's onpointerup to change the current mode
    playTimedButton.on('pointerup', function (e) { setGameState(gameState); currentMode = timedMode;});
    modeScene.addChild(playTimedButton);
    let playEndlessButton = createStateButton("ENDLESS", 270, 280, 1, buttonStyle);
    playEndlessButton.on('pointerup', function (e) { setGameState(gameState); currentMode = endlessMode;});
    modeScene.addChild(playEndlessButton);

    app.stage.addChild(modeScene);

}

//initializes all the objects needed to run the game from the title screen
function setUpGame() {
    //add our window keyboard listener
    window.addEventListener("keydown", keysDown);
    window.addEventListener("keyup", keysUp);

    //init our HUD containers for different game states
    gameScene = new PIXI.Container();

    bloomFilter = new PIXI.filters.AdvancedBloomFilter();
    bloomFilter.quality = 10;
    bloomFilter.bloomScale = .5;

    hexPath = [];
    // Adding a stage background
    gameScene.addChild(createSprite('../media/background-panel.jpg', 0.5, 0.5, 512, 288));

    for (let y = 0; y < hexGridHeight; y++) {
        //on even row
        if (y % 2 == 0) {
            for (let x = 0; x < hexGridWidth; x += 2) {
                let hex = new Hexagon(getScreenSpaceX(x), getScreenSpaceY(y), x, y, hexRadius, Math.trunc(Math.random() * 6), null, null);
                hexArray.push(hex);
                gameScene.addChild(hex);
            }
        }
        //odd row
        else {
            for (let x = 1; x < hexGridWidth; x += 2) {
                let hex = new Hexagon(getScreenSpaceX(x), getScreenSpaceY(y), x, y, hexRadius, Math.trunc(Math.random() * 6), null, null);
                hexArray.push(hex);
                gameScene.addChild(hex);
            }
        }
    }

    // for falling
    for (let i = 0; i < hexGridWidth / 2; i++) {
        columnWaitAmount.push(0);
    }

    pathIndicator = new PathIndicator();
    gameScene.addChild(pathIndicator);

    gameScene.filters = [bloomFilter];

    // animates white line
    displacementSprite = PIXI.Sprite.from('media/displacement-map-tiling.jpg');
    // Make sure the sprite is wrapping.
    displacementSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
    displacementFilter = new PIXI.filters.DisplacementFilter(displacementSprite);

    gameScene.addChild(displacementSprite);

    wrongMoveIndicator = new WrongMoveIndicator();
    gameScene.addChild(wrongMoveIndicator);

    
    gameScene.addChild(timeTracker);
    gameScene.addChild(scoreTracker);

    // events for drag end
    // app.stage.on('pointerup', onDragEnd);
    window.addEventListener('mouseup', onDragEnd);

    pathIndicator.filters = [displacementFilter];

    displacementFilter.scale.x = 17;
    displacementFilter.scale.y = 17;

    app.stage.addChild(gameScene);

    //finally, run our update loop!
    app.ticker.add(updateLoop);
}

// Inits the pause menu
function setUpPause() {
    let buttonStyle = new PIXI.TextStyle({
        fill: 0xffeb0b,
        fontSize: 48,
        fontFamily: "Amaranth",
        dropShadow: true,
        dropShadowAlpha: 1,
        dropShadowBlur: 5,
        dropShadowDistance: 1
    });

    // Adding a stage background
    pauseScene.addChild(createSprite('../media/background-panel.jpg', 0.5, 0.5, 512, 288));

    // Creating the logo
    let logo = createSprite('../media/pause-logo.png', 0, 0, 240, 50);
    logo.width = 250;
    logo.height = 80;
    pauseScene.addChild(logo);

    // Creating the buttons
    let gameStateButton = createStateButton("Back to Game", 75, 180, gameState, buttonStyle);
    pauseScene.addChild(gameStateButton);
    let modeButton = createStateButton("Change Mode", 75, 240, modeState, buttonStyle);
    pauseScene.addChild(modeButton);
    let backButton = createStateButton("Return to Menu", 75, 300, titleState, buttonStyle);
    pauseScene.addChild(backButton);
    let endGameButton = createStateButton("End Game", 75, 360, endGameState, buttonStyle);
    pauseScene.addChild(endGameButton);

    app.stage.addChild(pauseScene);
}

// Inits everything for the end card
function setUpEnd() {
    let buttonStyle = new PIXI.TextStyle({
        fill: 0xffeb0b,
        fontSize: 48,
        fontFamily: "Amaranth",
        dropShadow: true,
        dropShadowAlpha: 1,
        dropShadowBlur: 5,
        dropShadowDistance: 1
    });

    // Adding a stage background
    endGameScene.addChild(createSprite('../media/background-panel.jpg', 0.5, 0.5, 512, 288));

    // Creating the logo
    let logo = createSprite('../media/game-over-logo.png', 0, 0, 115, 50);
    logo.width = 500;
    logo.height = 80;
    endGameScene.addChild(logo);

    // Creating the buttons
    let backButton = createStateButton("Return to Menu", 75, 180, 0, buttonStyle);
    endGameScene.addChild(backButton);

    app.stage.addChild(endGameScene);
}

//switches the game between its various states and runs specific 
//code depending on which state its switching to
function setGameState(state) {
    //0 - title screen;
    //1 - how to play
    //2 - game
    //3 - pause
    //4 - endgame

    // Resets the game if changing into it from any state other than pause
    if (currentState != pauseState && state == gameState) {
        // populateHexGrid();
        // breakAllHexes();
        recolorHexGrid();
        currentTimeInSec = startTimeInSec;
        score = 0;
    }

    //store our new state
    currentState = state;

    //hide all HUD containers
    for (let scene of scenes) {
        scene.visible = false;
    }
    //and unhide the one for the state we are switching to
    scenes[state].visible = true;
}

// Helper function to rebuild the hex grid on demand
function recolorHexGrid() {
    for (let hex of hexArray) {
        hex.randomizeColors();
    }
}

// Creates and returns a button that calls setGameState
// I have no idea why, but passing in a callback function refused to work and I am very upsetti about it :(
function createStateButton(text, x, y, targetState, style = buttonStyle) {
    //store the text and position values
    let button = new PIXI.Text(text);
    button.style = style;
    button.x = x;
    button.y = y;
    button.anchor.set(0, .5);
    //make it interactive
    button.interactive = true;
    button.buttonMode = true;
    //when the user clicks down, set our selected button to this one
    // button.on('pointerdown', function (e) { selectedButton = button });
    //when the user releases the click; if this is the same button their clicked down on, then call its function!
    button.on('pointerup', function (e) { setGameState(targetState); });
    //if the user hovers over the button, change alpha
    button.on('pointerover', function (e) { e.target.alpha = 0.7; });
    //if the user unhovers this button, return alpha back to normal
    button.on('pointerout', e => e.currentTarget.alpha = 1.0);
    return button;
}

function createText(text, x, y, style) {
    //store the text and position values
    let textItem = new PIXI.Text(text);
    textItem.style = style;
    textItem.x = x;
    textItem.y = y;
    textItem.anchor.set(0, .5);
    return textItem;
}

// Creates a Sprite
function createSprite(url, anchorX, anchorY, posX, posY) {
    let img = PIXI.Sprite.from(url);
    img.anchor.x = anchorX;
    img.anchor.y = anchorY;
    img.position.x = posX;
    img.position.y = posY;

    return img;
}


//this gets called every frame, updates and renders our 3D graphics
function updateLoop() {
    // #1 - Calculate "delta time"
    let dt = 1 / app.ticker.FPS;
    if (dt > 1 / 12) dt = 1 / 12;
    frameTime = dt;

    //get our mouse position
    mousePosition = app.renderer.plugins.interaction.mouse.global;

    if(wrongMoveIndicator.currentBlinkAmount < wrongMoveIndicator.currentBlinkAmountMax){
        wrongMoveIndicator.update();
    }

    //update all the hex particle systems
    for (let i = 0; i < hexBreakParticles.length; i++) {
        hexBreakParticles[i].update();
        hexBreakParticles[i].drawParticleSystem();

        //remove "dead" ones
        if (hexBreakParticles[i].currentLifeTime <= 0) {
            hexBreakParticles[i].clear();
            gameScene.removeChild(hexBreakParticles[i]);
            hexBreakParticles.shift();
            i--;
        }
    }

    //break the hexes sequentially, in order they are in the path
    if (hexBreakAnimationTime > 0) {
        hexBreakAnimationTime -= frameTime;
        hexBreakAnimationTimePerHex -= frameTime;
        if (hexPath.length > 0 && hexBreakAnimationTimePerHex <= 0) {
            breakHex(hexPath[0]);
            hexPath.shift();
            hexBreakAnimationTimePerHex = hexBreakAnimationTimeMaxPerHex;
        }
        return;
    }

    //once we are done watching all the hexes break, begin making them fall to fill in the space
    if (hexBreakAnimationTime <= 0 && hexBreakAnimationTime != -1) {
        hexBreakAnimationTime = -1;
        hexBreakAnimationTimePerHex = -1;
        scanBoardForFallableHexes();
    }

    pathIndicator.clear();
    pathIndicator.drawLine();

    // You can hit esc to pause the game now
    if (keysHeld["27"]) {
        setGameState(pauseState);
    }

    //check for E press to rotate hex CW
    if (highlightedHex != null && keysHeld["69"]) {
        highlightedHex.rotateCW();
    }

    //check for Q press to rotate hex CCW
    if (highlightedHex != null && keysHeld["81"]) {
        highlightedHex.rotateCCW();
    }

    //DEBUG, prints hex info
    if (highlightedHex != null && !keysHeld["87"] && keysReleased["87"]) {
        console.log(highlightedHex.hexagonValues);
        console.log("x: " + highlightedHex.posX + ", y: " + highlightedHex.posY);
        console.log(highlightedHex.wantedRotationValue);
    }

    //adds destroyed hexs to graveyard
    for (let i = 0; i < destroyedHexArray.length; i++) {
        for (let j = 0; j < hexArray.length; j++) {
            if (destroyedHexArray[i] == hexArray[j]) {
                hexArray[j] = new Hexagon();
            }
        }
    }

    //update hex data
    for (let i = 0; i < hexArray.length; i++) {
        hexArray[i].update();
    }

    // Offsets the displacement map each frame
    displacementSprite.x += 1;
    displacementSprite.y += 1;
    // keep our displacement map's position within the necessary bounds
    if (displacementSprite.x > displacementSprite.width) { displacementSprite.x = 0; }
    if (displacementSprite.y > displacementSprite.height) { displacementSprite.y = 0; }

    if (rotationCoolDown > 0)
        rotationCoolDown -= frameTime;

    if (hexFallAnimationTime > 0)
        hexFallAnimationTime -= frameTime;

    //animates the hexes to fall during the hex fall animation
    //ones every fallable hex has fallen 1 tile, it checks again for any more fallen hexes
    //the animation is over once every spot on the baord is filled with a hex
    if (hexFallAnimationTime <= 0 && hexFallAnimationTime != -1) {
        if (scanBoardForFallableHexes()) {
            hexFallAnimationTime = hexFallAnimationTimeMax;
        }
        else {
            hexFallAnimationTime = -1;
            for (let i = 0; i < hexGridWidth / 2; i++) {
                columnWaitAmount[i] = 0;
            }
        }
    }

    // change to only decrease on first click
    if(gameStarted && currentMode != endlessMode){
        currentTimeInSec -= dt;
        if(currentTimeInSec <= 0){
            currentTimeInSec = 0;
            // END GAME
        }
    }
    currentMode != endlessMode ? timeTracker.text = secondsToTimeString(currentTimeInSec) : timeTracker.text = ``;

    //reset our controls for next frame
    keysReleased = [];
}

//finds a hexagon as a specific positon on the grid
//if no hex exists there, then null is returned
function findHexAtPos(x, y) {
    if (y >= hexGridHeight)
        return null;

    if (x >= hexGridWidth || x < 0)
        return null;

    for (let i = 0; i < hexArray.length; i++) {
        if (hexArray[i].posX == x && hexArray[i].posY == y) {
            return hexArray[i];
        }
    }

    return null;
}

//spawns a particle system, and moves the broken hex up above the game board
//rerolls its color values, so it looks like a completely new, random hex
//has been spawned in from up above
function breakHex(hex) {
    //spawn a break hex particle
    let particle = new HexBreakParticleSystem(hex.x, hex.y, hex.colorIndices[0], hex.colorIndices[1], hex.colorIndices[2]);
    hexBreakParticles.push(particle);
    gameScene.addChild(particle);

    let column = Math.trunc(hex.posX / 2);
    columnWaitAmount[column]++;
    hex.posY = -columnWaitAmount[column];
    if (hex.posY % 2 == 0) {
        hex.posX = column * 2
    } else {
        hex.posX = column * 2 + 1;
    }
    hex.x = getScreenSpaceX(hex.posX);
    hex.y = getScreenSpaceY(hex.posY);
    hex.falling = true;
    hex.randomizeColors();
}


//when  the user stops dragging the handle
function onDragEnd(e) {
    gameStarted = true;

    if (hexFallAnimationTime > 0 || hexBreakAnimationTime > 0)
        return;

    console.log("Drag End (for whole window)");
    let completePath = compareHexes(hexPath);
    if (completePath) {
        detectShape(hexPath);   
        //start the hex breaking animation
        hexBreakAnimationTime = hexBreakAnimationTimeMax;
        hexBreakAnimationTimeMaxPerHex = hexBreakAnimationTimeMax / hexPath.length;

        //if too many hexes are in the path, the break timer could be too small
        //hexes would need to break in between frames basically
        //so we effectively clamp it to prevent it from getting too small
        if (hexBreakAnimationTimeMaxPerHex < .03) {
            hexBreakAnimationTimeMaxPerHex = .03;
            hexBreakAnimationTime = hexPath.length * .03;
        }

        hexBreakAnimationTimePerHex = 0;
        hexBreakAnimationTime += .1;

        // score and timer
        score += hexPath.length;
        scoreTracker.text = scoreString + score;

        currentTimeInSec += hexPath.length; // currently add one sec for each hex

        pathIndicator.clear();
    } else {
        //if the path is wrong in any way
        if(hexPath.length > 1){
            wrongMoveIndicator.x = getScreenSpaceX(wrongMovePositionAndDirection.posX + (wrongMovePositionAndDirection.directionX / 2));
            wrongMoveIndicator.y = getScreenSpaceY(wrongMovePositionAndDirection.posY + (wrongMovePositionAndDirection.directionY / 2));
            wrongMoveIndicator.currentBlinkAmount = 0;
            wrongMoveIndicator.currentBlinkTime = wrongMoveIndicator.currentBlinkTimeMax;
        }
        hexPath = [];
    }
    dragStartHex = null;
    mouseHeldDown = false;
}

//checks if any hex is fallable (meaning it can move down 1 row to fill an empty slot
//in the game board)
//returns TRUE if atleast 1 hex can fall, false if no hex can fall
function scanBoardForFallableHexes() {
    let hexIsFallable = false;
    for (let i = hexArray.length - 1; i >= 0; i--) {
        hexArray[i].checkIfFallable();
        if (hexArray[i].falling)
            hexIsFallable = true;
    }
    return hexIsFallable;
}


//Cool debug function that destroys all hexes sequentially, top to bottom, left to right
function breakAllHexes() {
    if (hexFallAnimationTime > 0 || hexBreakAnimationTime > 0)
        return;

    hexPath = [];

    for (let y = 0; y < hexGridHeight; y++) {
        //on even row
        if (y % 2 == 0) {
            for (let x = 0; x < hexGridWidth; x += 2) {
                hexPath.push(findHexAtPos(x, y));
            }
        }
        //odd row
        else {
            for (let x = 1; x < hexGridWidth; x += 2) {
                hexPath.push(findHexAtPos(x, y));
            }
        }
    }

    console.log("Breaking all hexes");
    //start the hex breaking animation
    hexBreakAnimationTime = hexBreakAnimationTimeMax;
    hexBreakAnimationTimeMaxPerHex = hexBreakAnimationTimeMax / hexPath.length;

    //if too many hexes are in the path, the break timer could be too small
    //hexes would need to break in between frames basically
    //so we effectively clamp it to prevent it from getting too small
    if (hexBreakAnimationTimeMaxPerHex < .03) {
        hexBreakAnimationTimeMaxPerHex = .03;
        hexBreakAnimationTime = hexPath.length * .03;
    }

    hexBreakAnimationTimePerHex = 0;
    hexBreakAnimationTime += .1;

    pathIndicator.clear();
    dragStartHex = null;
    mouseHeldDown = false;
}

//translates a position in the hex array/hex grid to the pixel coordinates on screen
function getScreenSpaceX(x) {
    return hexGridDisplayX + x * (hexRadius * 1);
}

//translates a position in the hex array/hex grid to the pixel coordinates on screen
function getScreenSpaceY(y) {
    return hexGridDisplayY + y * (hexRadius * 1.6);
}

//event for key press downward
function keysDown(e) {
    //prevent Space bar from scrollin down to the middle of the page
    if (e.keyCode == 32 && e.target == document.body) {
        e.preventDefault();
    }

    //store this key press
    keysHeld[e.keyCode] = true;
    keysReleased[e.keyCode] = false;
}

//event for letting go of a key
function keysUp(e) {
    //store this key release
    keysHeld[e.keyCode] = false;
    keysReleased[e.keyCode] = true;
}

//creates a tiling background from a texture and adds it to a scene
//also returns the tiling background
function createBg(texture, scene) {
    //create new bG based on the texture
    let tiling = new PIXI.TilingSprite(texture, 1024, 576);

    //reset its position and add to scene
    tiling.position.set(0, 0);
    scene.addChild(tiling);

    //return it
    return tiling;
}
