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

    //if this tile is being hovered over
    highlighted;

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

        let colorsRGB = [{ r: 255, g: 0, b: 0 }, { r: 245, g: 139, b: 0 }, { r: 255, g: 208, b: 0 }, { r: 0, g: 145, b: 0 }, { r: 0, g: 110, b: 255}, { r: 116, g: 0, b: 184}];
        let colors = [rgbToHex(255, 0, 0), rgbToHex(245, 139, 0), rgbToHex(255, 208, 0), rgbToHex(0, 145, 0), rgbToHex(0, 110, 255), rgbToHex(116, 0, 184)];
        let colorIndices = [Math.trunc(Math.random() * 6), Math.trunc(Math.random() * 6), Math.trunc(Math.random() * 6)];

        // for(let i = 0; i < 3; i++){
        //     colorIndices[i] = Math.trunc(Math.random() * 6);
        // }

        for(let i = 0; i < 6; i++){
            let brightness = Math.abs(moveIntoRange((i + rotationValue), -3, 3)) * 65 + 40;
            let color = colorsRGB[colorIndices[Math.trunc(i / 2)]];
            let bevelColor = rgbToHex(color.r + (brightness - 128) * 1.6, color.g + (brightness - 128) * 1.6, color.b + (brightness - 128) * 1.6) ;
            this.lineStyle(1, bevelColor);
            this.beginFill(colors[colorIndices[Math.trunc(i / 2)]]);
            this.drawPolygon([
                Math.sin(rad(60 * (i + rotationValue))) * radius, Math.cos(rad(60 * (i + rotationValue))) * radius,
                Math.sin(rad(60 * (i + 1 + rotationValue))) * radius, Math.cos(rad(60 * (i + 1 + rotationValue))) * radius,
                0, 0,
            ])
            this.endFill;
            this.lineStyle(3, bevelColor);
            this.moveTo(Math.sin(rad(60 * (i + rotationValue))) * radius, Math.cos(rad(60 * (i + rotationValue))) * radius)
                .lineTo(Math.sin(rad(60 * (i + 1 + rotationValue))) * radius, Math.cos(rad(60 * (i + 1 + rotationValue))) * radius);
        }

        this.endFill();
        this.on('pointerover', function (e) { if (mouseHeldDown) { hexPath.push(this);  } e.target.alpha = 1.5; });
        this.on('pointerout', function (e) { e.currentTarget.alpha = 1.0; });

        // events for drag start
        this.on('pointerdown', this.onDragStart);
        // events for drag end
        this.on('pointerup', this.onDragEnd);
        // events for drag move
        this.on('pointermove', this.onDragMove);

        this.dragFunction = dragFunction;
        this.endDragFunction = endDragFunction;
    }


    //when the user clicks on this trackbar, start dragging the handle to the mouse positon
    onDragStart(e) {
        console.log("DRAG START");
        mouseHeldDown = true;
    }

    //when  the user stops dragging the handle
    onDragEnd(e) {
        console.log("DRAG END");


        hexPath = [];
        mouseHeldDown = false;
    }

    //dragging the handle to the mouse positon
    onDragMove(e) {
        //console.log("DRAG MOVE")
    }
}