"use strict";
const app = new PIXI.Application({
    width: 1024,
    height: 576
});
document.body.appendChild(app.view);

//resolution of the entire canvas area
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;

//the stage we are rendering everything to
let stage;

//all the HUDs for each game state
let titleScene;
let howToPlayScene;
let gameScene;
let scenes = [];

//the state the game is currently in. defines behavior and sounds at that time
let gameState = 0;
//0 - title screen;
//1 - how to play
//2 - gameplay

//Key names for local storage
const prefix = "nmb9745-";
const carColorKey = prefix + "carColor";

//variables needed to run the game
let hexRadius = 40;
let hexArray;
let hexGridHeight = 6;
let hexGridWidth = 6 * 2;

let hexGridDisplayX = 100;
let hexGridDisplayY = 100;


//objects that store the states of user's input/controls
let mousePosition;
let keysHeld = [];
let keysReleased = [];

//once finished, call the setUpGame function
app.loader.onComplete.add(setUpGame);
app.loader.load();

//initializes all the objects needed to run the game from the title screen
function setUpGame() {
    //add our window keyboard listener
    window.addEventListener("keydown", keysDown);
    window.addEventListener("keyup", keysUp);

    //set up our scenes/containers
    stage = app.stage;
    for(let y = 0; y < hexGridHeight; y++){
        //on even row
        if(y % 2 == 0){
            for (let x = 0; x < hexGridWidth; x+= 2) {
                app.stage.addChild(new Hexagon(hexGridDisplayX + x * (hexRadius * 1), hexGridDisplayY + y * (hexRadius * 1.6), x, y, hexRadius, Math.trunc(Math.random() * 6), null, null));
            }
        }
        //odd row
        else{
            for (let x = 1; x < hexGridWidth; x+= 2) {
                app.stage.addChild(new Hexagon(hexGridDisplayX + x * (hexRadius * 1), hexGridDisplayY + y * (hexRadius * 1.6), x, y, hexRadius, Math.trunc(Math.random() * 6), null, null));
            }
        }

    }
    
    //init our HUD containers for different game states
    gameScene = new PIXI.Container();

    //store our scenes for easy access later
    scenes = [titleScene, howToPlayScene, gameScene];

    //our game state starts at 0 (title screen)
    //setGameState(0);

    //finally, run our update loop!
    app.ticker.add(updateLoop);
}

//switches the game between its various states and runs specific 
//code depending on which state its switching to
function setGameState(state) {
    //0 - title screen;
    //1 - how to play
    //2 - game

    //store our new state
    gameState = state;

    //hide all HUD containers
    for (let i = 0; i < scenes.length; i++) {
        scenes[i].visible = false;
    }
    //and unhide the one for the state we are switching to
    scenes[state].visible = true;
}


//creates a button for our menus and sets its properties
//returns said button
function createButton(text, x, y, func, style = buttonStyle) {
    //store the text and position values
    let button = new PIXI.Text(text);
    button.style = style;
    button.x = x;
    button.y = y;
    button.anchor.set(.5, .5);
    //make it interactive
    button.interactive = true;
    button.buttonMode = true;
    //when the user clicks down, set our selected button to this one
    button.on('pointerdown', function (e) { selectedButton = button });
    //when the user releases the click; if this is the same button their clicked down on, then call its function and play a sound!
    button.on('pointerup', function (e) { if (button == selectedButton) { func(); buttonClickSound.play(); } });
    //if the user hovers over the button, change alpha and play a sound
    button.on('pointerover', function (e) { buttonHoverSound.play(); e.target.alpha = 0.7; });
    //if the user unhovers this button, return alpha back to normal
    button.on('pointerout', e => e.currentTarget.alpha = 1.0);
    return button;
}


//this gets called every frame, updates and renders our 3D graphics
function updateLoop() {
    // #1 - Calculate "delta time"
    let dt = 1 / app.ticker.FPS;
    if (dt > 1 / 12) dt = 1 / 12;

    //get our mouse position
    mousePosition = app.renderer.plugins.interaction.mouse.global;



    //reset our controls for next frame
    keysReleased = [];
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
