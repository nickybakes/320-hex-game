class Hexagon extends PIXI.Graphics {
    // position in the hex grid
    posX;
    posY;

    //state for whether its ebing dragged or not
    dragging;

    //size values
    radius;

    //how many stepped rotations this hex is rotated by, counter clockwise
    rotationValue;

    //functions to call
    dragFunction;
    endDragFunction;

    //inits this hexagon and stores its values
    constructor(screenX = 0, screenY = 0, posX = 0, posY = 0, radius, rotationValue, dragFunction, endDragFunction = dragFunction) {
        super();
        this.radius = radius;
        this.x = screenX;
        this.y = screenY;
        this.posX = posX;
        this.posY = posY;
        this.rotationValue = rotationValue;
        this.interactive = true;
        this.buttonMode = true;

        let colors = [0xFF0000, 0xf58b00, 0xFFd000, 0x009100, 0x006eff, 0x7400b8]
        let colorIndices = [Math.trunc(Math.random() * 6), Math.trunc(Math.random() * 6), Math.trunc(Math.random() * 6)];

        // for(let i = 0; i < 3; i++){
        //     colorIndices[i] = Math.trunc(Math.random() * 6);
        // }

        for(let i = 0; i < 6; i++){
            this.beginFill(colors[colorIndices[Math.trunc(i/2)]]);
            this.drawPolygon([
                Math.sin(rad(60 * (i + rotationValue))) * radius, Math.cos(rad(60 * (i + rotationValue))) * radius,
                Math.sin(rad(60 * (i + 1 + rotationValue))) * radius, Math.cos(rad(60 * (i + 1 + rotationValue))) * radius,
                0, 0,
            ])
        }

        this.endFill();
        // this.on('pointerover', function (e) { buttonHoverSound.play(); e.target.alpha = 0.7; });
        // this.on('pointerout', e => e.currentTarget.alpha = 1.0);

        // events for drag start
        this.on('pointerdown', this.onDragStart)
        // events for drag end
        this.on('pointerup', this.onDragEnd)
        this.on('pointerupoutside', this.onDragEnd)
        // events for drag move
        this.on('pointermove', this.onDragMove)

        this.dragFunction = dragFunction;
        this.endDragFunction = endDragFunction;
    }


    //when the user clicks on this trackbar, start dragging the handle to the mouse positon
    onDragStart(e) {
        console.log("DRAG START")
    }

    //when  the user stops dragging the handle
    onDragEnd(e) {
        console.log("DRAG END")
    }


    //dragging the handle to the mouse positon
    onDragMove(e) {
        //console.log("DRAG MOVE")
    }
}