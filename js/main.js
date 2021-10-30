"use strict";
const app = new PIXI.Application({
    width: 1024,
    height: 576,
    antialias: true,
    autoDensity: true, // !!!
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

// sounds
let buttonSound = new Howl({
    src: ['media/buttonClick.mp3']
});
let buttonHoverSound = new Howl({
    src: ['media/button-hover.mp3'],
    volume: .25
});
let challengeCompleteSound = new Howl({
    src: ['media/challenge-complete.mp3'],
    volume: .34
});
let startTickSound = new Howl({
    src: ['media/startTick.wav']
});
let startSound = new Howl({
    src: ['media/startSound.wav']
});
let timerSound = new Howl({
    src: ['media/timerTick.mp3'],
    volume: 1.2
});
let breakSound = new Howl({
    src: ['media/break.mp3']
});
let breakSoundQuiet = new Howl({
    src: ['media/break.mp3'],
    volume: .2
});
let comboSound = new Howl({
    src: ['media/startSound.wav'],
    volume: .5
});
let hexPathInvalidSound = new Howl({
    src: ['media/hex-path-invalid.mp3']
});
let tutorialHintSound = new Howl({
    src: ['media/tutorial-hint.mp3']
});
let rotateCWSound = new Howl({
    src: ['media/rotate-CW.mp3'],
    volume: .35
});
let rotateCCWSound = new Howl({
    src: ['media/rotate-CCW.mp3'],
    volume: .35
});
let endSound = new Howl({
    src: ['media/endSound.wav']
});

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

let soundMuteText;
let howlerVolumeDefault = .4;

const soundMuteTextStyle = new PIXI.TextStyle({
    fill: 0xDCDFE2,
    fontFamily: "PT Serif",
    fontSize: 20,
    padding: 5
});

// timer variables
const whiteText = new PIXI.TextStyle({
    fill: "white",
    fontFamily: "PT Serif",
    fontSize: 30,
    stroke: 0x00000,
    strokeThickness: 8,
    fontWeight: 'bolder',
    letterSpacing: 4
});
const redText = new PIXI.TextStyle({
    fill: "#d10023",
    fontFamily: "PT Serif",
    fontSize: 30,
    stroke: 0x00000,
    strokeThickness: 8,
    fontWeight: 'bolder',
    letterSpacing: 4
});
let startTimeInSec = 30;
let currentTimeInSec = startTimeInSec;
let prevTime = currentTimeInSec;
let startCountdown = false;
let countDown = false;
let timeTracker = new PIXI.Text('timer', whiteText);
timeTracker.x = 800;
timeTracker.y = 105;

let score = 0;
let scoreTracker = new PIXI.Text(score, whiteText);
scoreTracker.anchor.x = .5;
scoreTracker.x = 862;
scoreTracker.y = 207;
scoreTracker.style.fontFamily = "PT Serif";
let comboCount = 0;
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
let scoreIndicators = [];
let timeAddIndicator;
let timeToAdd;

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
let challengeShapes = ["Triangle", "Rhombus", "Diamond", "Lightning", "W"];
let challengeRewards = [60, 350, 250, 410, 520];
let challengeSprites = [];
let challengeCheckerFunctions = [checkForTriangle, checkForRhombus, checkForDiamond, checkForLightning, checkForW];
let challengeIndex1 = 3;
let challengeIndex2 = 4;

let challengeTitle1;
let challengeTitle2;
let challengeDescription1;
let challengeDescription2;
let challengeReward1;
let challengeReward2;

//this is ONLY true if the callenge is correct in the pathing and the path is valid.
let challengeComplete1;
//this is ONLY true if the callenge is correct in the pathing and the path is valid.
let challengeComplete2;

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
    dropShadowDistance: 1,
    fontWeight: "bold",
    stroke: 0x00000,
    strokeThickness: 8,
});
const finalScoreStyle = new PIXI.TextStyle({
    fill: 0xffde85,
    fontSize: 100,
    fontFamily: "PT Serif",
    stroke: true,
    dropShadow: true,
    dropShadowAlpha: 1,
    dropShadowBlur: 5,
    dropShadowDistance: 1,
    fontWeight: 'bolder',
    align: 'center',
    stroke: 0x00000,
    strokeThickness: 8
});
const buttonStyleMedium = new PIXI.TextStyle({
    fill: 0xc7c7c7,
    fontSize: 37,
    fontFamily: 'PT Serif',
    dropShadow: true,
    dropShadowAlpha: 1,
    dropShadowBlur: 5,
    dropShadowDistance: 1,
    fontWeight: "bold",
    stroke: 0x00000,
    strokeThickness: 8,
});
const textStyle = new PIXI.TextStyle({
    fill: 0xffd900,
    fontSize: 21,
    fontFamily: 'PT Serif',
    wordWrapWidth: 492,
    wordWrap: true,
    padding: 10
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
    fontSize: 24,
    fontFamily: 'PT Serif',
    fontStyle: 'italic',
    padding: 10
});

const textStyle4 = new PIXI.TextStyle({
    fill: 0xffd900,
    fontSize: 18,
    fontFamily: 'PT Serif',
    wordWrapWidth: 112,
    wordWrap: true,
    padding: 5
});
const countdownStyle = new PIXI.TextStyle({
    fill: 0xffde85,
    fontSize: 150,
    fontFamily: "PT Serif",
    stroke: true,
    dropShadow: true,
    dropShadowAlpha: 1,
    dropShadowBlur: 5,
    dropShadowDistance: 1,
    fontWeight: 'bolder',
    stroke: 0x00000,
    strokeThickness: 8
});

const countdownStyle2 = new PIXI.TextStyle({
    fill: 0xffde85,
    fontSize: 140,
    fontFamily: "PT Serif",
    stroke: true,
    dropShadow: true,
    dropShadowAlpha: 1,
    dropShadowBlur: 5,
    dropShadowDistance: 1,
    fontWeight: 'bolder',
    align: 'center',
    stroke: 0x00000,
    strokeThickness: 8
});

const scoreIndicatorStyle = new PIXI.TextStyle({
    fill: 0xffde85,
    fontSize: 45,
    fontFamily: "PT Serif",
    stroke: true,
    dropShadow: true,
    dropShadowAlpha: 1,
    dropShadowBlur: 5,
    dropShadowDistance: 1,
    fontWeight: 'bolder',
    stroke: 0x00000,
    strokeThickness: 8,
    fontStyle: 'italic',
    padding: 15
});

const challengeCompleteIndicatorStyle = new PIXI.TextStyle({
    fill: 0xffde85,
    fontSize: 65,
    fontStyle: 'italic',
    fontFamily: "PT Serif",
    stroke: true,
    dropShadow: true,
    dropShadowAlpha: 1,
    dropShadowBlur: 5,
    dropShadowDistance: 1,
    fontWeight: 'bolder',
    stroke: 0x00000,
    strokeThickness: 8,
    padding: 15
});

let howToPlayTextPopup1;
let howToPlayTextPopup2;

let scoreNumber;

//once finished, call the setUpGame function
app.loader.onComplete.add(setupScenes);
app.loader.load();

// Initializing the game's scenes- This should always be the first setup function called
function setupScenes() {
    Howler.volume(howlerVolumeDefault);
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
    backgroundRefractionGraphic.alpha = .1;

    backgroundRefractionGraphic2 = new PIXI.TilingSprite(backgroundRefractionSprite, 1024, 576);
    backgroundRefractionGraphic2.alpha = .08;

    backgroundRefractionGraphic3 = new PIXI.TilingSprite(backgroundRefractionSprite, 1024, 576);
    backgroundRefractionGraphic3.alpha = .08;

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

    soundMuteText = createText("Mute sound", 1006, 44, soundMuteTextStyle, 1);
    app.stage.addChild(soundMuteText);

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
        dropShadowDistance: 1,
        fontWeight: "bolder",
        letterSpacing: 10,
        stroke: 0x00000,
        strokeThickness: 8,
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
    let playButton = createStateButton("PLAY", 374, 330, howToPlayState, playButtonStyle, .5);
    playButton.on('pointerup', function (e) { setGameState(howToPlayState); playButtonClick(); });
    titleScene.addChild(playButton);
    // let howToPlayButton = createStateButton("How To Play", 75, 240, 1, buttonStyle);
    // titleScene.addChild(howToPlayButton);

    app.stage.addChild(titleScene);

}

//Plays a little rainbow effect when the Play button is clicked on the title screen
function playButtonClick() {
    breakSound.play();
    challengeCompleteSound.play();

    for (let i = 0; i < 6; i++) {
        let particle = new HexBreakParticleSystem(374 + (i - 2.5) * 80, 330, i, i, i);
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

    let demoHex1 = new Hexagon(274, getScreenSpaceY(3), 3.5, 3, hexRadius, 1, null, null);
    demoHex1.setColorsAndRotation(3, 1, 2, 0);
    demoHexArray.push(demoHex1);
    let demoHex2 = new Hexagon(374, getScreenSpaceY(3), 5.5, 3, hexRadius, 3, null, null);
    demoHex2.setColorsAndRotation(2, 4, 1, 0);
    demoHexArray.push(demoHex2);
    let demoHex3 = new Hexagon(474, getScreenSpaceY(3), 7.5, 3, hexRadius, 2, null, null);
    demoHex3.setColorsAndRotation(3, 2, 4, 0);
    demoHexArray.push(demoHex3);
    howToPlayScene.addChild(demoHex1);
    howToPlayScene.addChild(demoHex2);
    howToPlayScene.addChild(demoHex3);
    // titleScene.addChild(new Hexagon(getScreenSpaceX(6), getScreenSpaceY(4), 5, 3, hexRadius, Math.trunc(Math.random() * 6), null, null));

    howToPlayScene.addChild(backgroundRefractionGraphic2);

    // Adding a stage background
    howToPlayScene.addChild(createSprite('media/background-panel-menu.png', 0.5, 0.5, 512, 288));

    howToPlayScene.addChild(createText("You are a mage building a spell from multiple magical elements. Combine them by drawing lines between sections that share a color or icon. You can rotate hexes with Q and E, and match multiple colors in one path!", 134, 212, textStyle));
    //"Try to get ALL THREE in one go!";
    //The colors only need to match between 2 adjacent segments.
    howToPlayTextPopup1 = createText("Try to get ALL THREE in one go!", 374, 410, textStyle2, .5);
    howToPlayTextPopup2 = createText("Remember: the colors only need to match between adjacent segments.", 374, 450, textStyle2, .5);
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
    let playTimedButton = createStateButton("TIMED", 232, 200, gameState, buttonStyleLarge, .5);
    // tweak the state button's onpointerup to change the current mode
    playTimedButton.on('pointerup', function (e) { currentMode = timedMode; setGameState(gameState); });
    playTimedButton.on('pointerover', function (e) { e.target.alpha = 0.7; timedModeExplanationText.alpha = 1; endlessModeExplanationText.alpha = 0; });
    modeScene.addChild(playTimedButton);
    modeScene.addChild(createText("Frantic & Fun", 232, 250, textStyle, .5));
    let playEndlessButton = createStateButton("ENDLESS", 500, 200, 1, buttonStyleLarge, .5);
    playEndlessButton.on('pointerup', function (e) { currentMode = endlessMode; setGameState(gameState); });
    playEndlessButton.on('pointerover', function (e) { e.target.alpha = 0.7; timedModeExplanationText.alpha = 0; endlessModeExplanationText.alpha = 1; });
    modeScene.addChild(playEndlessButton);
    modeScene.addChild(createText("Chill & Relaxed", 495, 250, textStyle, .5));

    //explanation of gamemodes:
    let generalExplanationText = "\n  - Breaking long paths of hexes combos up points and grants higher scores.\n  - Complete challenges to earn even more points (see right for examples)!";
    timedModeExplanationText = createText("Timed: The clock is ticking! Break hexes and complete challenges to earn points and time. Large combos give even more time. When the clock runs out, its game over!\n" + generalExplanationText, 129, 380, textStyle);
    modeScene.addChild(timedModeExplanationText);
    endlessModeExplanationText = createText("Endless: Go for as long as you want. Great for practicing and plenty relaxing.\n" + generalExplanationText, 129, 380, textStyle);
    modeScene.addChild(endlessModeExplanationText);
    endlessModeExplanationText.alpha = 0;

    let backButton = createStateButton("Back", 129, 510, howToPlayState, buttonStyleMedium);
    modeScene.addChild(backButton);


    let challengeText = createText("Challenges:", 861, 275, textStyle4);
    challengeText.anchor.x = .5;
    challengeText.anchor.y = .5;
    modeScene.addChild(challengeText);
    let text = createText("Triangle", 792, 335, textStyle4);
    text.anchor.x = .5;
    let nameText = createText("Triad", 792, 312, textStyle3);
    nameText.anchor.x = .55;
    modeScene.addChild(nameText);
    modeScene.addChild(text);

    let rewardText = createText(challengeRewards[0], 792, 508, textStyle2);
    rewardText.anchor.x = .5;
    modeScene.addChild(rewardText);
    modeScene.addChild(createSprite('media/challenge-0.png', 0.5, 0.5, 792, 420));

    let challengeText2 = createText("Challenges:", 861, 275, textStyle4);
    challengeText2.anchor.x = .5;
    challengeText2.anchor.y = .5;
    modeScene.addChild(challengeText2);
    let text2 = createText("Lightning", 931, 335, textStyle4);
    text2.anchor.x = .5;
    let nameText2 = createText("Smite", 931, 312, textStyle3);
    nameText2.anchor.x = .55;
    modeScene.addChild(nameText2);
    modeScene.addChild(text2);

    let rewardText2 = createText(challengeRewards[3], 931, 508, textStyle2);
    rewardText2.anchor.x = .5;
    modeScene.addChild(rewardText2);
    modeScene.addChild(createSprite('media/challenge-3.png', 0.5, 0.5, 931, 420));


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


    // for falling
    for (let i = 0; i < hexGridWidth / 2; i++) {
        columnWaitAmount.push(0);
    }

    wrongMoveIndicator = new WrongMoveIndicator();
    let wmi_proxy = wrongMoveIndicator;
    gameScene.addChild(wmi_proxy);

    gameScene.addChild(timeTracker);
    gameScene.addChild(scoreTracker);

    gameControlTextValues = [createText('3', 374, 275, countdownStyle, .5),
    createText('2', 374, 275, countdownStyle, .5),
    createText('1', 374, 275, countdownStyle, .5),
    createText('MATCH!', 374, 275, countdownStyle, .5),
    createText('GAME\nOVER!', 374, 275, countdownStyle, .5)];

    for (let textItem of gameControlTextValues) {
        gameScene.addChild(textItem);
        textItem.visible = false;
    }
    gameControlTextValues[0].visible = true;


    //challenges HUD
    let challengeText = createText("Challenges:", 861, 275, textStyle4);
    challengeText.anchor.x = .5;
    challengeText.anchor.y = .5;
    gameScene.addChild(challengeText);

    challengeTitle1 = createText("Triad", 792, 312, textStyle3);
    challengeTitle1.anchor.x = .55;
    gameScene.addChild(challengeTitle1);

    challengeDescription1 = createText("Triangle", 792, 335, textStyle4);
    challengeDescription1.anchor.x = .5;
    gameScene.addChild(challengeDescription1);

    challengeReward1 = createText(challengeRewards[0], 792, 508, textStyle2);
    challengeReward1.anchor.x = .5;
    gameScene.addChild(challengeReward1);

    challengeTitle2 = createText("Triad", 931, 312, textStyle3);
    challengeTitle2.anchor.x = .55;
    gameScene.addChild(challengeTitle2);

    challengeDescription2 = createText("Triangle", 931, 335, textStyle4);
    challengeDescription2.anchor.x = .5;
    gameScene.addChild(challengeDescription2);

    challengeReward2 = createText(challengeRewards[0], 931, 508, textStyle2);
    challengeReward2.anchor.x = .5;
    gameScene.addChild(challengeReward2);

    for (let i = 0; i < challengeShapes.length; i++) {
        challengeSprites.push(createSprite('media/challenge-' + i + '.png', 0.5, 0.5, 792, 420));
        challengeSprites[i].visible = false;
        gameScene.addChild(challengeSprites[i]);
    }

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
    let logo = createSprite('media/pause-logo.png', 0, 0, 260, 70);
    logo.width = 250;
    logo.height = 80;
    pauseScene.addChild(logo);

    // Creating the buttons
    let gameStateButton = createStateButton("Resume", 374, 224, gameState, buttonStyleLarge, .5);
    pauseScene.addChild(gameStateButton);
    let endGameButton = createStateButton("End Game", 374, 294, gameState, buttonStyleLarge, .5);
    endGameButton.on('pointerup', function (e) { forceEndGame(); });
    pauseScene.addChild(endGameButton);
    let modeButton = createStateButton("Quit to Menu", 374, 364, modeState, buttonStyleLarge, .5);
    pauseScene.addChild(modeButton);
    // let backButton = createStateButton("Quit to Menu", 75, 300, titleState, buttonStyleLarge);
    // pauseScene.addChild(backButton);


    app.stage.addChild(pauseScene);
}

// Inits everything for the end card
function setUpEnd() {
    // Adding a stage background
    endGameScene.addChild(createSprite('media/background-panel.png', 0.5, 0.5, 512, 288));

    // Creating the logo
    let logo = createSprite('media/game-over-logo.png', 0, 0, 115, 70);
    logo.width = 500;
    logo.height = 80;
    endGameScene.addChild(logo);

    // NOTE: DO THIS IN UPDATELOOP, APPARENTLY PIXI TEXT DOES NOT UPDATE DYNAMICALLY
    // endGameScene.addChild(createText(`Your final score: ${score}`, 75, 150, textStyle));
    // howToPlayScene.addChild(createText("High Score: ", 75, 170, textStyle));

    // Creating the buttons
    let replayButton = createStateButton("Play Again", 374, 410, gameState, buttonStyleLarge, .5);
    endGameScene.addChild(replayButton);
    let backToMenuButton = createStateButton("Quit to Menu", 374, 480, modeState, buttonStyleLarge, .5);
    endGameScene.addChild(backToMenuButton);


    let scoreText = createText(`Final Score:`, 374, 215, buttonStyleLarge, .5);
    // 40px left per digit
    scoreNumber = createText(" ", 374, 310, finalScoreStyle, .5);
    endGameScene.addChild(scoreText);
    endGameScene.addChild(scoreNumber);

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
            if (currentState != pauseState) {
                isGameOver = false;
                hexFallAnimationTime = -1;
                hexBreakAnimationTime = -1;
                for (let textItem of gameControlTextValues) {
                    textItem.visible = false;
                }
                gameControlTextValues[4].visible = false;
                gameControlTextValues[0].visible = true;
                for (let i = 0; i < challengeShapes.length; i++) {
                    challengeSprites[i].visible = false;
                }
                pickChallenge1();
                pickChallenge2();
                if(!isGameOver){
                    setScore(0);
                }
                countdownTimer = countdownTimeMax;
                textValueIndex = 0;
                isInCountdown = true;
                recolorHexGrid();

                timeTracker.style = whiteText;

                if (currentMode == endlessMode) {
                    timeTracker.x = 862;
                    timeTracker.anchor.x = .5;
                    setTime(0);
                } else {
                    timeTracker.x = 862;
                    timeTracker.anchor.x = .5;
                    setTime(startTimeInSec);
                }

                if (timeAddIndicator != null) {
                    gameScene.removeChild(timeAddIndicator);
                    timeAddIndicator = null;
                }


                for (let i = 0; i < columnWaitAmount.length; i++) {
                    columnWaitAmount[i] = 0;
                }

                //make sure all the hexes fall
                while (scanBoardForFallableHexes()) {
                    scanBoardForFallableHexes();
                }

                for (let i = 0; i < hexArray.length; i++) {
                    hexArray[i].x = getScreenSpaceX(hexArray[i].posX);
                    hexArray[i].y = getScreenSpaceY(hexArray[i].posY);
                }

                setHexInteractive(false);
            }
            passChildren(gameState);
            backgroundRefractionGraphic.alpha = .02;
            if (!isGameOver)
                gameStarted = true;
            break;
        case pauseState:
            backgroundRefractionGraphic.alpha = .1;
            break;
        case modeState:
            backgroundRefractionGraphic.alpha = .1;
            isInCountdown = false;
            currentTimeInSec = startTimeInSec;
            recolorHexGrid();
            break;
        case howToPlayState:
            isInCountdown = false;
            passChildren(howToPlayState);
            demoHexArray[0].setColorsAndRotation(3, 1, 2, 0);
            demoHexArray[1].setColorsAndRotation(2, 4, 1, 0);
            demoHexArray[2].setColorsAndRotation(3, 2, 4, 0);
            howToPlayTextPopup1.alpha = 0;
            howToPlayTextPopup2.alpha = 0;
            backgroundRefractionGraphic.alpha = 0;
            break;
        default:
            isInCountdown = false;
            backgroundRefractionGraphic.alpha = .1;
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

function pickChallenge1() {
    let previousChallenge = challengeIndex1;
    challengeSprites[challengeIndex1].visible = false;
    challengeIndex1 = Math.trunc(Math.random() * challengeShapes.length);
    //keep randomizing to make sure we dont get 2 of the same challenge
    while (challengeIndex1 == challengeIndex2 || previousChallenge == challengeIndex1) {
        challengeIndex1 = Math.trunc(Math.random() * challengeShapes.length);
    }
    challengeComplete1 = false;

    challengeSprites[challengeIndex1].visible = true;
    challengeSprites[challengeIndex1].x = 792;
    challengeTitle1.text = challengeNames[challengeIndex1];
    challengeDescription1.text = challengeShapes[challengeIndex1];
    challengeReward1.text = challengeRewards[challengeIndex1];
}

function pickChallenge2() {
    let previousChallenge = challengeIndex2;
    challengeSprites[challengeIndex2].visible = false;
    challengeIndex2 = Math.trunc(Math.random() * challengeShapes.length);
    //keep randomizing to make sure we dont get 2 of the same challenge
    while (challengeIndex2 == challengeIndex1 || previousChallenge == challengeIndex2) {
        challengeIndex2 = Math.trunc(Math.random() * challengeShapes.length);
    }
    challengeComplete2 = false;

    challengeSprites[challengeIndex2].visible = true;
    challengeSprites[challengeIndex2].x = 931;
    challengeTitle2.text = challengeNames[challengeIndex2];
    challengeDescription2.text = challengeShapes[challengeIndex2];
    challengeReward2.text = challengeRewards[challengeIndex2];
}

function completeChallenge1() {
    challengeCompleteSound.play();
    //reward points
    setScore(score + challengeRewards[challengeIndex1]);

    if (currentMode == timedMode) {
        timeToAdd += challengeRewards[challengeIndex1] / 60;
        timeAddIndicator.setAmount(timeToAdd);
    }

    let challengeIndicator = new ScoreIndicator(792, 350, challengeRewards[challengeIndex1], challengeCompleteIndicatorStyle);
    gameScene.addChild(challengeIndicator);
    scoreIndicators.push(challengeIndicator);

    for (let i = 0; i < 3; i++) {
        let particle = new HexBreakParticleSystem(792, 390 + 35 * i, 6, 7, 8);
        hexBreakParticles.push(particle);
        app.stage.addChild(particle);
    }


    pickChallenge1();
}

function setScore(newScore) {
    score = newScore;
    scoreTracker.text = score;
    scoreNumber.text = score;
}

function setTime(newTime) {
    currentTimeInSec = newTime;
    //controlling time text HUD
    if (currentTimeInSec > 10) {
        timeTracker.style = whiteText;
    }

    currentMode != endlessMode ? timeTracker.text = secondsToTimeString(currentTimeInSec) : timeTracker.text = secondsToTimeStringNoMilliSeconds(currentTimeInSec);
}

function completeChallenge2() {
    challengeCompleteSound.play();
    //reward points
    setScore(score + challengeRewards[challengeIndex2]);

    if (currentMode == timedMode) {
        timeToAdd += challengeRewards[challengeIndex2] / 20;
        timeAddIndicator.setAmount(timeToAdd);
    }

    let challengeIndicator = new ScoreIndicator(931, 350, challengeRewards[challengeIndex2], challengeCompleteIndicatorStyle);
    gameScene.addChild(challengeIndicator);
    scoreIndicators.push(challengeIndicator);

    for (let i = 0; i < 3; i++) {
        let particle = new HexBreakParticleSystem(931, 390 + 35 * i, 6, 7, 8);
        hexBreakParticles.push(particle);
        app.stage.addChild(particle);
    }
    pickChallenge2();
}

// Helper function to rebuild the hex grid on demand
function recolorHexGrid() {
    for (let hex of hexArray) {
        hex.randomizeColors();
    }
}

// Creates and returns a button that calls setGameState
// I have no idea why, but passing in a callback function refused to work and I am very upsetti about it :(
function createStateButton(text, x, y, targetState, style = buttonStyleLarge, anchorX = 0, anchorY = .5) {
    //store the text and position values
    let button = new PIXI.Text(text);
    button.style = style;
    button.x = x;
    button.y = y;
    button.anchor.set(anchorX, anchorY);
    //make it interactive
    button.interactive = true;
    button.buttonMode = true;
    //when the user clicks down, set our selected button to this one
    button.on('pointerdown', function (e) { buttonSound.play(); });
    //when the user releases the click; if this is the same button their clicked down on, then call its function!
    button.on('pointerup', function (e) { setGameState(targetState); });
    //if the user hovers over the button, change alpha
    button.on('pointerover', function (e) { e.target.alpha = 0.7; buttonHoverSound.play(); });
    //if the user unhovers this button, return alpha back to normal
    button.on('pointerout', e => e.currentTarget.alpha = 1.0);
    return button;
}

function createText(text, x, y, style, anchorX = 0, anchorY = .5) {
    //store the text and position values
    let textItem = new PIXI.Text(text);
    textItem.style = style;
    textItem.x = x;
    textItem.y = y;
    textItem.anchor.set(anchorX, anchorY);
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

function setHexInteractive(interactive) {
    for (let i = 0; i < hexArray.length; i++) {
        hexArray[i].ineractive = interactive;
        hexArray[i].buttonMode = interactive;
    }
}


//this gets called every frame, updates and renders our 3D graphics
function updateLoop() {
    // #1 - Calculate "delta time"
    let dt = 1 / app.ticker.FPS;
    if (dt > 1 / 12) dt = 1 / 12;
    frameTime = dt;

    //get our mouse position
    mousePosition = app.renderer.plugins.interaction.mouse.global;

    if (isInCountdown && currentState == gameState && !isGameOver) {
        if (countdownTimer == 1 && textValueIndex < 3) {
            setHexInteractive(false);
            startTickSound.play();
        }
        else if (countdownTimer == 1 && textValueIndex == 3) {
            startSound.play();
        }
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
                setHexInteractive(true);
            }
        }
    }

    if (!keysHeld["77"] && keysReleased["77"] && Howler.volume() == howlerVolumeDefault) {
        soundMuteText.text = "Unmute sound";
        Howler.volume(0);
    } else if (!keysHeld["77"] && keysReleased["77"] && Howler.volume() == 0) {
        soundMuteText.text = "Mute sound";
        Howler.volume(howlerVolumeDefault);
    }

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

    //update all the Points Indicators
    for (let i = 0; i < scoreIndicators.length; i++) {
        scoreIndicators[i].update();

        //remove "dead" ones
        if (scoreIndicators[i].currentLifeTime <= 0) {
            gameScene.removeChild(scoreIndicators[i]);
            scoreIndicators.shift();
            i--;
        }
    }

    if (timeAddIndicator != null) {
        timeAddIndicator.update();
        if (timeAddIndicator.currentAnimationTime <= 0) {
            gameScene.removeChild(timeAddIndicator);
            timeAddIndicator = null;
            setTime(currentTimeInSec + timeToAdd);
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

        if (isGameOver) {
            setGameState(endGameState);
        }
        else {
            for(let i = 0; i < hexPath.length; i++){
                breakHex(hexPath[i]);
            }
            hexPath = [];
            if (currentMode == timedMode) {
                timeAddIndicator.fadingAnimationPlaying = true;
            }
            scanBoardForFallableHexes();
        }

    }

    pathIndicator2.clear();
    pathIndicator2.drawLine();

    pathIndicator.clear();
    pathIndicator.drawLine();


    // You can hit esc to pause the game now
    if (!keysHeld["27"] && keysReleased["27"] && currentState == gameState && hexBreakAnimationTime == -1 && hexFallAnimationTime == -1) {
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
            setHexInteractive(true);
            hexFallAnimationTime = -1;
            for (let i = 0; i < hexGridWidth / 2; i++) {
                columnWaitAmount[i] = 0;
            }

            countDown = true;
        }
    }

    // change to only decrease on first click
    if (currentState == gameState && gameStarted && currentMode != endlessMode && !isInCountdown && hexBreakAnimationTime == -1 && hexFallAnimationTime == -1) {
        prevTime = currentTimeInSec;
        setTime(currentTimeInSec - frameTime);

        if (currentTimeInSec <= 10 && Math.ceil(currentTimeInSec) < Math.ceil(prevTime)) {
            timerSound.play();
            flashText();
        }

        if (currentTimeInSec <= 0) {
            isGameOver = true;

            // Change this if needed
            currentTimeInSec = -0.1;
            gameControlTextValues[4].visible = true;
            breakAllHexes();
            endSound.play();
            gameStarted = false;
        }
    }
    else if (currentState == gameState && gameStarted && currentMode == endlessMode && !isInCountdown && hexBreakAnimationTime == -1 && hexFallAnimationTime == -1) {
        setTime(currentTimeInSec + frameTime);
    }

    //controlling time text HUD
    currentMode != endlessMode ? timeTracker.text = secondsToTimeString(currentTimeInSec) : timeTracker.text = secondsToTimeStringNoMilliSeconds(currentTimeInSec);

    //reset our controls for next frame
    keysReleased = [];
}

function forceEndGame() {
    if (currentMode == timedMode) {
        isGameOver = true;

        // Change this if needed
        currentTimeInSec = -0.1;
        isInCountdown = false;
        for (let i = 0; i < gameControlTextValues.length; i++) {
            gameControlTextValues[i].visible = false;
        }
        gameControlTextValues[4].visible = true;
        breakAllHexes();
        endSound.play();
        gameStarted = false;
    } else {
        isGameOver = true;
        isInCountdown = false;
        for (let i = 0; i < gameControlTextValues.length; i++) {
            gameControlTextValues[i].visible = false;
        }
        gameControlTextValues[4].visible = true;
        breakAllHexes();
        endSound.play();
        gameStarted = false;
    }
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
    if (!isGameOver) {
        comboCount += 1;
        setScore(score + (comboCount * 10))
        scoreTracker.text = score;

        let scoreIndicator = new ScoreIndicator(hex.x, hex.y, comboCount * 10, scoreIndicatorStyle);
        gameScene.addChild(scoreIndicator);
        scoreIndicators.push(scoreIndicator);

        if (currentMode == timedMode && timeAddIndicator != null) {
            timeToAdd += Math.max(comboCount - 2, 0) / 3;
            timeAddIndicator.setAmount(timeToAdd);
        }

        if (hexPath.length + comboCount - 1 > 3) {
            comboSound.rate(1 + (comboCount - 1) / 30);
            comboSound.play();
        }
        breakSound.play();
    } else {
        breakSoundQuiet.rate = .7 + (Math.random() - .5) * .5
        breakSoundQuiet.play();
    }


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
        if (currentMode == timedMode) {
            timeToAdd = 0;
            timeAddIndicator = new TimeAddIndicator(862, 61, scoreIndicatorStyle, .6);
            gameScene.addChild(timeAddIndicator);
        }

        if (challengeComplete1) {
            completeChallenge1();
        }
        if (challengeComplete2) {
            completeChallenge2();
        }

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

        setHexInteractive(false);

        comboCount = 0;


        pathIndicator.clear();
        pathIndicator2.clear();
    } else if (completePath && currentState == howToPlayState && hexPath.length == 3) {
        hexPath = [];
        for (let i = 0; i < demoHexArray.length; i++) {
            let particle = new HexBreakParticleSystem(demoHexArray[i].x, demoHexArray[i].y, demoHexArray[i].colorIndices[0], demoHexArray[i].colorIndices[1], demoHexArray[i].colorIndices[2]);
            hexBreakParticles.push(particle);
            app.stage.addChild(particle);
        }
        breakSound.play();
        challengeCompleteSound.play();
        setGameState(modeState);
        pathIndicator.clear();
        pathIndicator2.clear();
    } else if (currentState == howToPlayState && completePath && hexPath.length == 2) {
        hexPath = [];
        howToPlayTextPopup1.alpha = 1;
        howToPlayTextPopup2.alpha = 1;
        pathIndicator.clear();
        pathIndicator2.clear();
        tutorialHintSound.play();
    } else {
        //if the path is wrong in any way
        if (hexPath.length > 1) {
            wrongMoveIndicator.x = getScreenSpaceX(wrongMovePositionAndDirection.posX + (wrongMovePositionAndDirection.directionX / 2));
            wrongMoveIndicator.y = getScreenSpaceY(wrongMovePositionAndDirection.posY + (wrongMovePositionAndDirection.directionY / 2));
            wrongMoveIndicator.currentBlinkAmount = 0;
            wrongMoveIndicator.currentBlinkTime = wrongMoveIndicator.currentBlinkTimeMax;
            hexPathInvalidSound.play();
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
function flashText() {
    if (timeTracker.style == whiteText) {
        timeTracker.style = redText;
    }
    else {
        timeTracker.style = whiteText;
    }
}