"use strict";
const app = new PIXI.Application({
    width: 1024,
    height: 576,
    antialias: true,
    autoDensity: true, // !!!
    resolution: 2,
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
let timedModeExplanationText;
let endlessModeExplanationText;

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

let showHexIcons = true;

// Demo variables
let demoHexArray = [];

// Countdown vars
let countdownTimeMax = 1;
let countdownTimer = countdownTimeMax;
let isInCountdown = false;
let gameControlTextValues = [];
let textValueIndex = 0;
// Game over vars
let isGameOver;

let highlightedHex;
let dragStartHex;
let pathIndicator;
let pathIndicator2;

//true if we should visually connect the white line to the start of the hex path
let connectPathToStart;

let hexGridDisplayX = 100;
let hexGridDisplayY = 100;

let rotationCoolDown;
let rotationCoolDownMax = .2;

// timer variables
const whiteText = new PIXI.TextStyle({
    fill: "white"
});
const redText = new PIXI.TextStyle({
    fill: "#d10023"
});
let startTimeInSec = 30;
let pausedTime = startTimeInSec;
let currentTimeInSec = startTimeInSec;
let startCountdown = false;
let countDown = false;
let timeTracker = new PIXI.Text('timer', whiteText);
timeTracker.x = 900;

let score = 0;
let scoreString = 'score: ';
let scoreTracker = new PIXI.Text('score: ' + score, whiteText);
let plusScore = new PIXI.Text('+ 1', whiteText);
let comboPoints = 0;
let gameStarted;

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
let displacementSprite2;
let displacementFilter;
let displacementFilter2;
let hexDisplacementSprite;
let bloomFilter;
let backgroundRefractionSprite;
let backgroundRefractionGraphic;
let backgroundRefractionGraphic2;
let backgroundRefractionGraphic3;

let backgroundOverlaySprite;
let backgroundOverlayGraphic;

let challengeNames = ["Triad", "Exert", "Riches", "Smite", "Valorous"];
let challengeShapes = ["traingle", "rhombus", "diamond", "lightning", "W"];
let challengeReward = [500, 800, 1000, 1000, 1200];
let challengeSprites = [];
let challengeCheckerFunctions = [checkForTriangle, checkForRhombus, checkForDiamond, checkForLightning, checkForW];
let challengeIndex1 = 3;
let challengeIndex2 = 4;

//this is ONLY true if the callenge is correct in the pathing and the path is valid.
let challengeComplete1;
//this is ONLY true if the callenge is correct in the pathing and the path is valid.
let challengeComplete2;

//this is true if the callenge is correct in the pathing.
let challengeCompleteInPath1;
//this is true if the callenge is correct in the pathing.
let challengeCompleteInPath2;



// let hexRefractionSprite;
// let hexRefractionGraphic;
// let hexRefractionMaskContainer;
// let hexRefractionMaskSprite;

// let hexRefractionGraphics = [];
// let hexRefractionMasks = [];

// let hexMaskTexture;
// let hexMaskGraphic;

// let maskedHexRefractionGraphic;

//objects that store the states of user's input/controls
let mousePosition;
let mouseHeldDown;
let keysHeld = [];
let keysReleased = [];

// Style objects for menu states used in multiple scenes
const buttonStyleLarge = new PIXI.TextStyle({
    fill: 0xc7c7c7,
    fontSize: 58,
    fontFamily: 'PT Serif',
    dropShadow: true,
    dropShadowAlpha: 1,
    dropShadowBlur: 5,
    dropShadowDistance: 1
});
const buttonStyleMedium = new PIXI.TextStyle({
    fill: 0xc7c7c7,
    fontSize: 37,
    fontFamily: 'PT Serif',
    dropShadow: true,
    dropShadowAlpha: 1,
    dropShadowBlur: 5,
    dropShadowDistance: 1
});
const textStyle = new PIXI.TextStyle({
    fill: 0xffd900,
    fontSize: 21,
    fontFamily: 'PT Serif',
    wordWrapWidth: 492,
    wordWrap: true
});
const textStyle2 = new PIXI.TextStyle({
    fill: 0xffffff,
    fontSize: 23,
    fontFamily: 'PT Serif',
    wordWrapWidth: 492,
    wordWrap: true
});

const textStyle3 = new PIXI.TextStyle({
    fill: 0xc7c7c7,
    fontSize: 26,
    fontFamily: 'PT Serif',
    fontStyle: 'italic',
    padding: 10
});

const textStyle4 = new PIXI.TextStyle({
    fill: 0xffd900,
    fontSize: 18,
    fontFamily: 'PT Serif',
});
const countdownStyle = new PIXI.TextStyle({
    fill: 0xffeb0b,
    fontSize: 150,
    fontFamily: "PT Serif",
    stroke: true,
    strokeThickness: 3,
    dropShadow: true,
    dropShadowAlpha: 1,
    dropShadowBlur: 5,
    dropShadowDistance: 1
});

let howToPlayTextPopup1;
let howToPlayTextPopup2;

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

    bloomFilter = new PIXI.filters.AdvancedBloomFilter();
    bloomFilter.quality = 5;
    bloomFilter.bloomScale = 1;
    bloomFilter.brightness = 1.1;
    bloomFilter.padding = 20;
    app.stage.filters = [bloomFilter];

    backgroundOverlaySprite = createSprite('media/background-panel.png', 0.5, 0.5, 512, 288);

    backgroundRefractionSprite = PIXI.Texture.from('media/background-refraction-pattern.jpg');
    backgroundRefractionGraphic = new PIXI.TilingSprite(backgroundRefractionSprite, 1024, 576);
    backgroundRefractionGraphic.alpha = .07;

    backgroundRefractionGraphic2 = new PIXI.TilingSprite(backgroundRefractionSprite, 1024, 576);
    backgroundRefractionGraphic2.alpha = .07;

    backgroundRefractionGraphic3 = new PIXI.TilingSprite(backgroundRefractionSprite, 1024, 576);
    backgroundRefractionGraphic3.alpha = .07;

    app.stage.addChild(backgroundRefractionGraphic);

    displacementSprite = PIXI.Sprite.from('media/displacement-map-tiling.jpg');
    displacementSprite2 = PIXI.Sprite.from('media/hex-gem-refraction.png');
    // Make sure the sprite is wrapping.
    displacementSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
    displacementFilter = new PIXI.filters.DisplacementFilter(displacementSprite);
    displacementFilter.padding = 60;

    displacementSprite2.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
    displacementFilter2 = new PIXI.filters.DisplacementFilter(displacementSprite2);
    displacementFilter2.padding = 60;

    displacementFilter.scale.x = 17;
    displacementFilter.scale.y = 17;

    displacementFilter2.scale.x = 13;
    displacementFilter2.scale.y = 13;

    app.stage.addChild(displacementSprite2);
    app.stage.addChild(displacementSprite);

    pathIndicator2 = new PathIndicator(16, .3, 0x969696);
    pathIndicator = new PathIndicator();

    pathIndicator.filters = [displacementFilter];
    pathIndicator2.filters = [displacementFilter2];

    //store our scenes for easy access later

    setUpTitle();
    setUpMode();
    setUpGame();
    setupHowToPlay();
    setUpPause();
    setUpEnd();
    scenes = [titleScene, howToPlayScene, modeScene, gameScene, pauseScene, endGameScene];

    //our game state starts at 0 (title screen)
    setGameState(0);
}

// Initialization for the Title screen
function setUpTitle() {
    let playButtonStyle = new PIXI.TextStyle({
        fill: 0xc7c7c7,
        fontSize: 60,
        fontFamily: 'PT Serif',
        dropShadow: true,
        dropShadowAlpha: 1,
        dropShadowBlur: 5,
        dropShadowDistance: 1
    });

    // This stuff has hardcoded locations, which I need to fix later

    let titleScreenBackground = PIXI.Sprite.from('media/title-screen-background.png');
    titleScreenBackground.alpha = .5;
    titleScene.addChild(titleScreenBackground);

    // Adding a stage background
    titleScene.addChild(createSprite('media/background-panel-menu.png', 0.5, 0.5, 512, 288));

    // Creating the logo
    let logo = createSprite('media/main-logo.png', 0, 0, 120, 150);
    logo.width = 500;
    logo.height = 80;
    titleScene.addChild(logo);

    // Creating the buttons
    let playButton = createStateButton("PLAY", 300, 330, howToPlayState, playButtonStyle);
    playButton.on('pointerup', function (e) { setGameState(howToPlayState); playButtonClick(); });
    titleScene.addChild(playButton);
    // let howToPlayButton = createStateButton("How To Play", 75, 240, 1, buttonStyle);
    // titleScene.addChild(howToPlayButton);

    // titleScene.addChild(new Hexagon(getScreenSpaceX(3), getScreenSpaceY(3), 3, 3, hexRadius, Math.trunc(Math.random() * 6), null, null));
    // titleScene.addChild(new Hexagon(getScreenSpaceX(5), getScreenSpaceY(3), 5, 3, hexRadius, Math.trunc(Math.random() * 6), null, null));
    // titleScene.addChild(new Hexagon(getScreenSpaceX(7), getScreenSpaceY(3), 5, 3, hexRadius, Math.trunc(Math.random() * 6), null, null));
    // titleScene.addChild(new Hexagon(getScreenSpaceX(4), getScreenSpaceY(4), 3, 3, hexRadius, Math.trunc(Math.random() * 6), null, null));
    // titleScene.addChild(new Hexagon(getScreenSpaceX(6), getScreenSpaceY(4), 5, 3, hexRadius, Math.trunc(Math.random() * 6), null, null));

    app.stage.addChild(titleScene);

}

//Plays a little rainbow effect when the Play button is clicked on the title screen
function playButtonClick(){
    for (let i = 0; i < 6; i++) {
        let particle = new HexBreakParticleSystem(160 + i * 80, 330, i, i, i);
        hexBreakParticles.push(particle);
        app.stage.addChild(particle);
    }
}

// Inits the tutorial
function setupHowToPlay() {

    // demoHexPath = [];



    // Creating the logo
    let logo = createSprite('media/how-to-play-logo.png', 0, 0, 170, 70);
    logo.width = 400;
    logo.height = 80;
    howToPlayScene.addChild(logo);

    let demoHex1 = new Hexagon(getScreenSpaceX(3), getScreenSpaceY(3), 3, 3, hexRadius, 1, null, null);
    demoHex1.setColorsAndRotation(3, 1, 2, 0);
    demoHexArray.push(demoHex1);
    let demoHex2 = new Hexagon(getScreenSpaceX(5), getScreenSpaceY(3), 5, 3, hexRadius, 3, null, null);
    demoHex2.setColorsAndRotation(2, 4, 1, 0);
    demoHexArray.push(demoHex2);
    let demoHex3 = new Hexagon(getScreenSpaceX(7), getScreenSpaceY(3), 7, 3, hexRadius, 2, null, null);
    demoHex3.setColorsAndRotation(3, 2, 4, 0);
    demoHexArray.push(demoHex3);
    howToPlayScene.addChild(demoHex1);
    howToPlayScene.addChild(demoHex2);
    howToPlayScene.addChild(demoHex3);
    // titleScene.addChild(new Hexagon(getScreenSpaceX(6), getScreenSpaceY(4), 5, 3, hexRadius, Math.trunc(Math.random() * 6), null, null));

    howToPlayScene.addChild(backgroundRefractionGraphic2);

    // Adding a stage background
    howToPlayScene.addChild(createSprite('media/background-panel-menu.png', 0.5, 0.5, 512, 288));

    howToPlayScene.addChild(createText("Drag your mouse between segments of the same color to make a match! Press Q and E to rotate hexes. Make longer paths of hexes for more points! Try finding a way to connect all 3 of these hexes with a path!", 129, 200, textStyle));
    //"Try to get ALL THREE in one go!";
    //The colors only need to match between 2 adjacent segments.
    howToPlayTextPopup1 = createText("Try to get ALL THREE in one go!", 190, 410, textStyle2);
    howToPlayTextPopup2 = createText("Remember: the colors only need to match between adjacent segments.", 129, 450, textStyle2);
    howToPlayTextPopup1.alpha = 0;
    howToPlayTextPopup2.alpha = 0;
    howToPlayScene.addChild(howToPlayTextPopup1);
    howToPlayScene.addChild(howToPlayTextPopup2);

    // Creating the buttons
    let playButton = createStateButton("Back", 129, 510, titleState, buttonStyleMedium);
    howToPlayScene.addChild(playButton);

    // for falling
    // for (let i = 0; i < hexGridWidth / 2; i++) {
    //     columnWaitAmount.push(0);
    // }


    app.stage.addChild(howToPlayScene);

    //finally, run our update loop!
    app.ticker.add(updateLoop);
}

// Initialization for the Mode screen
function setUpMode() {
    // Adding a stage background
    modeScene.addChild(createSprite('media/background-panel.png', 0.5, 0.5, 512, 288));

    // Creating the logo
    let logo = createSprite('media/mode-logo.png', 0, 0, 120, 70);
    logo.width = 500;
    logo.height = 80;
    modeScene.addChild(logo);

    // Creating the buttons
    let playTimedButton = createStateButton("TIMED", 140, 200, gameState, buttonStyleLarge);
    // tweak the state button's onpointerup to change the current mode
    playTimedButton.on('pointerup', function (e) { setGameState(gameState); currentMode = timedMode; });
    playTimedButton.on('pointerover', function (e) { e.target.alpha = 0.7; timedModeExplanationText.alpha = 1; endlessModeExplanationText.alpha = 0; });
    modeScene.addChild(playTimedButton);
    modeScene.addChild(createText("Frantic & Fun", 156, 250, textStyle));
    let playEndlessButton = createStateButton("ENDLESS", 400, 200, 1, buttonStyleLarge);
    playEndlessButton.on('pointerup', function (e) { setGameState(gameState); currentMode = endlessMode; });
    playEndlessButton.on('pointerover', function (e) { e.target.alpha = 0.7; timedModeExplanationText.alpha = 0; endlessModeExplanationText.alpha = 1; });
    modeScene.addChild(playEndlessButton);
    modeScene.addChild(createText("Chill & Relaxed", 440, 250, textStyle));

    //explanation of gamemodes:
    let generalExplanationText = "\n  - Breaking long paths of hexes combos up points and grants higher scores.\n  - Complete challenges to earn even more points (see right)!";
    timedModeExplanationText = createText("Timed: The clock is ticking! Break hexes and complete challenges to earn points and time. Large combos give even more time. When the clock runs out, its game over!\n" + generalExplanationText, 129, 380, textStyle);
    modeScene.addChild(timedModeExplanationText);
    endlessModeExplanationText = createText("Endless: Go for as long as you want. Great for practicing and plenty relaxing.\n\n" + generalExplanationText, 129, 380, textStyle);
    modeScene.addChild(endlessModeExplanationText);
    endlessModeExplanationText.alpha = 0;

    let backButton = createStateButton("Back", 129, 510, howToPlayState, buttonStyleMedium);
    modeScene.addChild(backButton);
    
    modeScene.addChild(createText("Challenges:", 810, 272, textStyle4));
    modeScene.addChild(createText("Triad", 766, 340, textStyle3));
    modeScene.addChild(createText("Draw a:", 766, 370, textStyle4));
    modeScene.addChild(createText("Triangle", 766, 400, textStyle4));


    app.stage.addChild(modeScene);

}

//initializes all the objects needed to run the game from the title screen
function setUpGame() {
    //add our window keyboard listener
    window.addEventListener("keydown", keysDown);
    window.addEventListener("keyup", keysUp);

    //init our HUD containers for different game states
    gameScene = new PIXI.Container();


    hexPath = [];

    hexDisplacementSprite = PIXI.Sprite.from('media/hex-displacement.jpg');
    // hexMaskTexture = PIXI.Texture.from('media/hex-mask.jpg');
    // hexRefractionSprite = PIXI.Texture.from('media/hex-gem-refraction.png');

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

    gameScene.addChild(backgroundRefractionGraphic3);

    // Adding a stage background
    gameScene.addChild(createSprite('media/background-panel.png', 0.5, 0.5, 512, 288));

    for(let i = 0; i < challengeShapes.length; i++){
        challengeSprites.push(createSprite('media/challenge-'+ i +'.png', 0.5, 0.5, 795, 435));
        challengeSprites[i].alpha = 0;
        gameScene.addChild(challengeSprites[i]);
    }
    challengeSprites[0].alpha = 1;

    // for falling
    for (let i = 0; i < hexGridWidth / 2; i++) {
        columnWaitAmount.push(0);
    }
    // hexRefractionMaskContainer = new PIXI.Container();
    // //set up masks for refraction effect
    // for (let i = 0; i < hexArray.length; i++) {
    //     let hexMaskGraphic = new PIXI.Sprite(hexMaskTexture);
    //     hexMaskGraphic.anchor.x = .5;
    //     hexMaskGraphic.anchor.y = .5;
    //     hexMaskGraphic.scale.x = .5;
    //     hexMaskGraphic.scale.y = .5;
    //     gameScene.addChild(hexMaskGraphic);
    //     hexRefractionMaskContainer.addChild(hexMaskGraphic);
    //     hexRefractionMasks.push(hexMaskGraphic);
    // }
    // hexRefractionMaskSprite = new PIXI.Sprite(app.renderer.generateTexture(hexRefractionMaskContainer));

    // maskedHexRefractionGraphic = new PIXI.Sprite();

    // let hexRefractionScaleFactor = .5;
    // hexRefractionGraphic = new PIXI.TilingSprite(hexRefractionSprite, 1024 / hexRefractionScaleFactor, 576 / hexRefractionScaleFactor);
    // hexRefractionGraphic.scale.x = hexRefractionScaleFactor;
    // hexRefractionGraphic.scale.y = hexRefractionScaleFactor;
    // hexRefractionGraphic.alpha = .15;
    // hexRefractionGraphic.blendMode = PIXI.BLEND_MODES.NORMAL;
    // gameScene.addChild(hexRefractionGraphic);
    // gameScene.addChild(maskedHexRefractionGraphic);
    //set up graphics for refractions/holographic look
    // for (let i = 0; i < hexArray.length; i++) {
    //     let hexRefractionGraphic = new PIXI.TilingSprite(hexRefractionSprite, 100, 100);
    //     hexRefractionGraphic.anchor.x = .5;
    //     hexRefractionGraphic.anchor.y = .5;
    //     hexRefractionGraphic.scale.x = hexRefractionScaleFactor;
    //     hexRefractionGraphic.scale.y = hexRefractionScaleFactor;
    //     hexRefractionGraphic.alpha = .15;
    //     hexRefractionGraphic.blendMode = PIXI.BLEND_MODES.NORMAL;
    //     gameScene.addChild(hexRefractionGraphic);
    //     hexRefractionGraphics.push(hexRefractionGraphic);
    //     hexRefractionGraphic.mask = hexRefractionMasks[i];
    // }

    wrongMoveIndicator = new WrongMoveIndicator();
    let wmi_proxy = wrongMoveIndicator;
    gameScene.addChild(wmi_proxy);


    gameScene.addChild(timeTracker);
    gameScene.addChild(scoreTracker);

    gameControlTextValues = [createText('3', 325, 275, countdownStyle), 
    createText('2', 325, 275, countdownStyle), 
    createText('1', 325, 275, countdownStyle), 
    createText('MATCH!', 125, 275, countdownStyle), 
    createText('TIME!', 200, 275, countdownStyle)];

    for (let textItem of gameControlTextValues) {
        gameScene.addChild(textItem);
        textItem.visible = false;
    }
    gameControlTextValues[0].visible = true;

    // events for drag end
    // app.stage.on('pointerup', onDragEnd);
    window.addEventListener('mouseup', onDragEnd);

    app.stage.addChild(gameScene);

    //finally, run our update loop!
    // app.ticker.add(updateLoop);
}

// Inits the pause menu
function setUpPause() {
    // Adding a stage background
    pauseScene.addChild(createSprite('media/background-panel.png', 0.5, 0.5, 512, 288));

    // Creating the logo
    let logo = createSprite('media/pause-logo.png', 0, 0, 240, 50);
    logo.width = 250;
    logo.height = 80;
    pauseScene.addChild(logo);

    // Creating the buttons
    let gameStateButton = createStateButton("Back to Game", 75, 180, gameState, buttonStyleLarge);
    pauseScene.addChild(gameStateButton);
    let modeButton = createStateButton("Quit to Mode Select", 75, 240, modeState, buttonStyleLarge);
    pauseScene.addChild(modeButton);
    // let backButton = createStateButton("Quit to Menu", 75, 300, titleState, buttonStyleLarge);
    // pauseScene.addChild(backButton);
    let endGameButton = createStateButton("End Game", 75, 300, endGameState, buttonStyleLarge);
    pauseScene.addChild(endGameButton);

    app.stage.addChild(pauseScene);
}

// Inits everything for the end card
function setUpEnd() {
    // Adding a stage background
    endGameScene.addChild(createSprite('media/background-panel.png', 0.5, 0.5, 512, 288));

    // Creating the logo
    let logo = createSprite('media/game-over-logo.png', 0, 0, 115, 50);
    logo.width = 500;
    logo.height = 80;
    endGameScene.addChild(logo);

    // NOTE: DO THIS IN UPDATELOOP, APPARENTLY PIXI TEXT DOES NOT UPDATE DYNAMICALLY
    // endGameScene.addChild(createText(`Your final score: ${score}`, 75, 150, textStyle));
    // howToPlayScene.addChild(createText("High Score: ", 75, 170, textStyle));

    // Creating the buttons
    let backToMenuButton = createStateButton("Return to Menu", 170, 500, modeState, buttonStyleLarge);
    endGameScene.addChild(backToMenuButton);

    let scoreText = createText(`Final Score: ${score}`, 170, 300, buttonStyleLarge);
    endGameScene.addChild(scoreText);

    // let backButton = createStateButton("Return to Menu", 75, 300, titleState, buttonStyleLarge);
    // endGameScene.addChild(backButton);

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
    
    // Handle anything that needs to run while transitioning between states
    switch (state) {
        case gameState:
            isGameOver = false;
            if (currentState != pauseState) {
                currentTimeInSec = startTimeInSec;
                score = 0;
                scoreTracker.text = 'score: ' + score;
                isInCountdown = true;
                recolorHexGrid();
            }
            currentTimeInSec = pausedTime;
            passChildren(gameState);
            backgroundRefractionGraphic.alpha = .02;
            challengeComplete1;
            challengeComplete2;
            gameStarted = true;
            break;
        case pauseState:
            pausedTime = currentTimeInSec;
            break;
        case modeState:
            currentTimeInSec = startTimeInSec;
            pausedTime = currentTimeInSec;
            recolorHexGrid();
            break;
        case howToPlayState:
            passChildren(howToPlayState);
            demoHexArray[0].setColorsAndRotation(3, 1, 2, 0);
            demoHexArray[1].setColorsAndRotation(2, 4, 1, 0);
            demoHexArray[2].setColorsAndRotation(3, 2, 4, 0);
            howToPlayTextPopup1.alpha = 0;
            howToPlayTextPopup2.alpha = 0;
            backgroundRefractionGraphic.alpha = 0;
            break;
        default:
            backgroundRefractionGraphic.alpha = .07;
            break;
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

// Helper function that passes objects between scenes
// Made so I don't have to literally recode half the drawing code because PIXI scenes are a tree
function passChildren(targetState) {
    if (targetState == gameState) {
        gameScene.addChild(pathIndicator2);
        gameScene.addChild(pathIndicator);
        gameScene.addChild(displacementSprite2);
        gameScene.addChild(displacementSprite);
        gameScene.addChild(wrongMoveIndicator);
    }
    else if (targetState == howToPlayState) {
        howToPlayScene.addChild(pathIndicator2);
        howToPlayScene.addChild(pathIndicator);
        howToPlayScene.addChild(displacementSprite2);
        howToPlayScene.addChild(displacementSprite);
        howToPlayScene.addChild(wrongMoveIndicator);
    }
}

function pickChallenge1(){
    let previousChallenge = challengeIndex1;
    challengeSprites[challengeIndex1].alpha = 0;
    challengeIndex1 = Math.trunc(Math.random() * challengeShapes.length);
    //keep randomizing to make sure we dont get 2 of the same challenge
    while (challengeIndex1 == challengeIndex2 || previousChallenge == challengeIndex1) {
        challengeIndex1 = Math.trunc(Math.random() * challengeShapes.length);
    }
    challengeComplete1 = false;
    challengeCompleteInPath1 = false;
}

function pickChallenge2() {
    let previousChallenge = challengeIndex2;
    challengeSprites[challengeIndex1].alpha = 0;
    challengeIndex2 = Math.trunc(Math.random() * challengeShapes.length);
    //keep randomizing to make sure we dont get 2 of the same challenge
    while (challengeIndex2 == challengeIndex1 || previousChallenge == challengeIndex2){
        challengeIndex2 = Math.trunc(Math.random() * challengeShapes.length);
    }
    challengeComplete2 = false;
    challengeCompleteInPath2 = false;
}

// Helper function to rebuild the hex grid on demand
function recolorHexGrid() {
    for (let hex of hexArray) {
        hex.randomizeColors();
    }
}

// Creates and returns a button that calls setGameState
// I have no idea why, but passing in a callback function refused to work and I am very upsetti about it :(
function createStateButton(text, x, y, targetState, style = buttonStyleLarge) {
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

    if (isInCountdown && currentState == gameState) {
        if (countdownTimer > 0) {
            countdownTimer -= dt;
            gameControlTextValues[textValueIndex].alpha = Math.sin(rad(180 * (countdownTimer / 2)));
        }
        if (countdownTimer <= 0) {
            countdownTimer = 1;
            gameControlTextValues[textValueIndex].visible = false;
            if (textValueIndex < 3) {
                textValueIndex++;
                gameControlTextValues[textValueIndex].visible = true;
            } else {
                textValueIndex = 0;
                isInCountdown = false;
            }
            
        }
    } else {

    }

    // for (let i = 0; i < hexRefractionMasks.length; i++) {
    //     hexRefractionMasks[i].x = hexArray[i].x;
    //     hexRefractionMasks[i].y = hexArray[i].y;
    //     //hexRefractionGraphics[i].x = hexArray[i].x;
    //     //hexRefractionGraphics[i].y = hexArray[i].y;
    // }

    // hexRefractionMaskSprite = new PIXI.Sprite(app.renderer.generateTexture(hexRefractionMaskContainer));

    // hexRefractionGraphic.mask = hexRefractionMaskSprite;

    //maskedHexRefractionGraphic = new PIXI.Sprite(app.renderer.generateTexture(hexRefractionGraphic));

    if (!keysHeld["73"] && keysReleased["73"]) {
        showHexIcons = !showHexIcons;
        if (currentState == howToPlayState) {
            for (let i = 0; i < demoHexArray.length; i++) {
                demoHexArray[i].clear();
                demoHexArray[i].drawHex();
            }
        } else {
            for (let i = 0; i < hexArray.length; i++) {
                hexArray[i].clear();
                hexArray[i].drawHex();
            }
        }
    }


    if (currentState == gameState) {
        if (hexBreakAnimationTime > 0 || hexFallAnimationTime > 0) {
            backgroundRefractionGraphic.tilePosition.x -= 68 * frameTime;
            backgroundRefractionGraphic.tilePosition.y -= 68 * frameTime;
            backgroundRefractionGraphic2.tilePosition.x -= 68 * frameTime;
            backgroundRefractionGraphic2.tilePosition.y -= 68 * frameTime;
            backgroundRefractionGraphic3.tilePosition.x -= 68 * frameTime;
            backgroundRefractionGraphic3.tilePosition.y -= 68 * frameTime;
        } else {
            backgroundRefractionGraphic.tilePosition.x -= 24 * frameTime;
            backgroundRefractionGraphic.tilePosition.y -= 24 * frameTime;
            backgroundRefractionGraphic2.tilePosition.x -= 24 * frameTime;
            backgroundRefractionGraphic2.tilePosition.y -= 24 * frameTime;
            backgroundRefractionGraphic3.tilePosition.x -= 24 * frameTime;
            backgroundRefractionGraphic3.tilePosition.y -= 24 * frameTime;

        }
    } else {
        backgroundRefractionGraphic.tilePosition.x -= 14 * frameTime;
        backgroundRefractionGraphic.tilePosition.y -= 14 * frameTime;
        backgroundRefractionGraphic2.tilePosition.x -= 14 * frameTime;
        backgroundRefractionGraphic2.tilePosition.y -= 14 * frameTime;
        backgroundRefractionGraphic3.tilePosition.x -= 14 * frameTime;
        backgroundRefractionGraphic3.tilePosition.y -= 14 * frameTime;
    }


    if (wrongMoveIndicator.currentBlinkAmount < wrongMoveIndicator.currentBlinkAmountMax) {
        wrongMoveIndicator.update();
    }
    //update all the hex particle systems
    for (let i = 0; i < hexBreakParticles.length; i++) {
        hexBreakParticles[i].update();
        hexBreakParticles[i].drawParticleSystem();

        //remove "dead" ones
        if (hexBreakParticles[i].currentLifeTime <= 0) {
            hexBreakParticles[i].clear();
            app.stage.removeChild(hexBreakParticles[i]);
            hexBreakParticles.shift();
            i--;
        }
    }

    //break the hexes sequentially, in order they are in the path
    if (hexBreakAnimationTime > 0) {
        countDown = false;

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

    pathIndicator2.clear();
    pathIndicator2.drawLine();

    pathIndicator.clear();
    pathIndicator.drawLine();


    // You can hit esc to pause the game now
    if (!keysHeld["27"] && keysReleased["27"] && currentState == gameState) {
        setGameState(pauseState);
    } else if (!keysHeld["27"] && keysReleased["27"] && currentState == pauseState) {
        setGameState(gameState);
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
    // if (highlightedHex != null && !keysHeld["87"] && keysReleased["87"]) {
    //     console.log(highlightedHex.hexagonValues);
    //     console.log("x: " + highlightedHex.posX + ", y: " + highlightedHex.posY);
    //     console.log(lerp(0, 255, highlightedHex.highlightOutlineBlinkValue));
    // }

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

    if (currentState == howToPlayState) {
        for (let i = 0; i < demoHexArray.length; i++) {
            demoHexArray[i].update();
        }
    }

    // Offsets the displacement map each frame
    displacementSprite.x += 60 * frameTime;
    displacementSprite.y += 60 * frameTime;
    // keep our displacement map's position within the necessary bounds
    if (displacementSprite.x > displacementSprite.width) { displacementSprite.x = 0; }
    if (displacementSprite.y >= displacementSprite.height) { displacementSprite.y = 0; }

    // Offsets the displacement map each frame
    displacementSprite2.x += 120 * (Math.random() - .5) * frameTime;
    displacementSprite2.y -= 60 * frameTime;
    // keep our displacement map's position within the necessary bounds
    if (displacementSprite2.x > displacementSprite2.width) { displacementSprite2.x = 0; }
    if (displacementSprite2.y < 0) { displacementSprite2.y = displacementSprite2.height; }

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

            countDown = true;
        }
    }

    // change to only decrease on first click
    if (gameStarted && currentMode != endlessMode && !isInCountdown) {
        currentTimeInSec -= dt;
        if (currentTimeInSec <= 0) {
            isGameOver = true;

            // Change this if needed
            currentTimeInSec = -0.1;
            setGameState(endGameState);
            gameStarted = false;
        }
    }

    //controlling time text HUD
    currentMode != endlessMode ? timeTracker.text = secondsToTimeString(currentTimeInSec) : timeTracker.text = ``;
    if(currentTimeInSec <= 10 && (Math.round(currentTimeInSec * 100) / 100) % 1 == 0){
        flashText();
    }

    timeTracker.text = secondsToTimeString(currentTimeInSec);

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
    //update score and timer
    score++;
    plusScore.text = "+1";
    scoreTracker.text = scoreString + score;

    currentTimeInSec++;

    //spawn a break hex particle
    let particle = new HexBreakParticleSystem(hex.x, hex.y, hex.colorIndices[0], hex.colorIndices[1], hex.colorIndices[2]);
    hexBreakParticles.push(particle);
    app.stage.addChild(particle);

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

    addScoreAnimation(hex.x, hex.y);
}


//when  the user stops dragging the handle
function onDragEnd(e) {
    startCountdown = true;
    countDown = true;

    if (hexFallAnimationTime > 0 || hexBreakAnimationTime > 0)
        return;

    //console.log("Drag End (for whole window)");
    let completePath = compareHexes(hexPath);
    if (completePath && currentState == gameState && !isInCountdown) {
        //detectShape(hexPath);
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
        pathIndicator2.clear();
    } else if (completePath && currentState == howToPlayState && hexPath.length == 3) {
        hexPath = [];
        for (let i = 0; i < demoHexArray.length; i++) {
            let particle = new HexBreakParticleSystem(demoHexArray[i].x, demoHexArray[i].y, demoHexArray[i].colorIndices[0], demoHexArray[i].colorIndices[1], demoHexArray[i].colorIndices[2]);
            hexBreakParticles.push(particle);
            app.stage.addChild(particle);
        }
        setGameState(modeState);
        pathIndicator.clear();
        pathIndicator2.clear();
    } else if (currentState == howToPlayState && completePath && hexPath.length == 2) {
        hexPath = [];
        howToPlayTextPopup1.alpha = 1;
        howToPlayTextPopup2.alpha = 1;
        pathIndicator.clear();
        pathIndicator2.clear();
    } else {
        //if the path is wrong in any way
        if (hexPath.length > 1) {
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

    //console.log("Breaking all hexes");
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
    pathIndicator2.clear();
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

// flash timer text
function flashText(){
    if(timeTracker.style == whiteText){
        timeTracker.style = redText;
    }
    else{
        timeTracker.style = whiteText;
    }
}

function addScoreAnimation(posX, posY){
    console.log("AA");
    plusScore.x = posX;
    plusScore.y = posY;
    gameScene.addChild(plusScore);
    for(let i = 10; i > 0; i--){
        plusScore.y -= i;
    }
}