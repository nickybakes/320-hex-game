class Hexagon extends PIXI.Graphics {
    // position in the hex grid
    posX;
    posY;

    //state for whether its being dragged or not
    dragging;

    //size values
    radius;

    //how many stepped rotations this hex is currently rotated by, counter clockwise
    rotationValue;

    //how many stepped rotations this hex SHOULD be rotated by, counter clockwise
    wantedRotationValue;

    //functions to call
    dragFunction;
    endDragFunction;

    //if this tile is being hovered over
    highlighted;

    currentRotationVelocity;

    absoluteRotationVelocity = 10;

    falling;
    belowX;
    belowY;
    belowPosX;


    //stores values of hexagon
    hexagonValues;



    colorsRGB = [{ r: 255, g: 0, b: 0 }, { r: 245, g: 139, b: 0 }, { r: 255, g: 208, b: 0 }, { r: 0, g: 145, b: 0 }, { r: 0, g: 110, b: 255 }, { r: 116, g: 0, b: 184 }];
    colorIndices;

    //inits this hexagon and stores its values
    constructor(screenX = 0, screenY = 0, posX = 0, posY = 0, radius, rotationValue, dragFunction, endDragFunction = dragFunction) {
        super();
        this.radius = radius;
        this.x = screenX;
        this.y = screenY;
        this.posX = posX;
        this.posY = posY;
        this.rotationValue = rotationValue;
        this.wantedRotationValue = rotationValue;
        this.interactive = true;
        this.buttonMode = true;

        this.randomizeColors();

        this.on('pointerover', this.onMouseEnter);
        this.on('pointerout', this.onMouseLeave);

        // events for drag start
        this.on('pointerdown', this.onDragStart);
        // events for drag end
        this.on('pointerup', this.onDragEnd);
        // events for drag move
        this.on('pointermove', this.onDragMove);

        this.dragFunction = dragFunction;
        this.endDragFunction = endDragFunction;
    }

    randomizeColors(){
        this.colorIndices = [];
        this.hexagonValues = [];
        this.colorIndices = [Math.trunc(Math.random() * 6), Math.trunc(Math.random() * 6), Math.trunc(Math.random() * 6)];

        //This part assigns hexagonValues a value
        this.hexagonValues = giveHexValue(this.rotationValue, this.colorIndices);

        this.clear();
        this.drawHex();
    }

    rotateCW() {
        if (rotationCoolDown > 0 || hexFallAnimationTime > 0)
            return;

        if (this.currentRotationVelocity == 0) {
            rotationCoolDown = rotationCoolDownMax;
            this.wantedRotationValue -= 1;
            this.currentRotationVelocity = -this.absoluteRotationVelocity;
        }
    }

    rotateCCW() {
        if (rotationCoolDown > 0 || hexFallAnimationTime > 0)
            return;

        if (this.currentRotationVelocity == 0) {
            rotationCoolDown = rotationCoolDownMax;
            this.wantedRotationValue += 1;
            this.currentRotationVelocity = this.absoluteRotationVelocity;
        }
    }

    update() {
        if(this.falling && hexFallAnimationTime > 0){
            this.x = lerp(this.x, this.belowX, (hexFallAnimationTimeMax - hexFallAnimationTime) / hexFallAnimationTimeMax);
            this.y = lerp(this.y, this.belowY, (hexFallAnimationTimeMax - hexFallAnimationTime) / hexFallAnimationTimeMax);
        }

        if (this.falling && hexFallAnimationTime <= 0) {
            this.x = this.belowX;
            this.y = this.belowY;
            this.falling = false;
        }

        if(hexFallAnimationTime > 0)
            return;

        if (this.currentRotationVelocity > 0 && this.wantedRotationValue - this.rotationValue > 0) {
            this.rotationValue += this.currentRotationVelocity * frameTime;
            this.clear();
            this.drawHex();
        }
        else if (this.currentRotationVelocity < 0 && this.rotationValue - this.wantedRotationValue > 0) {
            this.rotationValue += this.currentRotationVelocity * frameTime;
            this.clear();
            this.drawHex();
        }

        if (this.currentRotationVelocity > 0 && this.wantedRotationValue - this.rotationValue < 0) {
            this.rotationValue = this.wantedRotationValue;
            this.currentRotationVelocity = 0;

            this.hexagonValues.unshift(this.hexagonValues[this.hexagonValues.length - 1]);
            this.hexagonValues.pop();

            this.clear();
            this.drawHex();
        }
        else if (this.currentRotationVelocity < 0 && this.rotationValue - this.wantedRotationValue < 0) {
            this.rotationValue = this.wantedRotationValue;
            this.currentRotationVelocity = 0;

            this.hexagonValues.push(this.hexagonValues[0]);
            this.hexagonValues.shift();
            
            this.clear();
            this.drawHex();
        } else if (this.currentRotationVelocity != 0 && this.rotationValue == this.wantedRotationValue) {
            this.currentRotationVelocity = 0;
        }

    }

    drawHex() {
        this.beginFill();

        for (let i = 0; i < 6; i++) {
            let brightness = Math.abs(moveIntoRange((i + this.rotationValue), -3, 3)) * 65 + 40;
            let color = this.colorsRGB[this.colorIndices[Math.trunc(i / 2)]];
            let bevelColor = rgbToHex(color.r + (brightness - 128) * 1.6, color.g + (brightness - 128) * 1.6, color.b + (brightness - 128) * 1.6);
            this.lineStyle(1, bevelColor);
            this.beginFill(rgbToHex(color.r + (brightness - 128) * 0, color.g + (brightness - 128) * 0, color.b + (brightness - 128) * 0));
            this.drawPolygon([
                Math.sin(rad(60 * (i + this.rotationValue))) * this.radius, Math.cos(rad(60 * (i + this.rotationValue))) * this.radius,
                Math.sin(rad(60 * (i + 1 + this.rotationValue))) * this.radius, Math.cos(rad(60 * (i + 1 + this.rotationValue))) * this.radius,
                0, 0,
            ])
            this.endFill;
            this.lineStyle(3, bevelColor);
            this.moveTo(Math.sin(rad(60 * (i + this.rotationValue))) * this.radius, Math.cos(rad(60 * (i + this.rotationValue))) * this.radius)
                .lineTo(Math.sin(rad(60 * (i + 1 + this.rotationValue))) * this.radius, Math.cos(rad(60 * (i + 1 + this.rotationValue))) * this.radius);
        }

        this.endFill();
    }

    //when the user clicks on this hexagon, start dragging the handle to the mouse positon
    //if they enter the hex while dragging the handle, add this hex to the path if it follows conditions
    onMouseEnter(e) {
        //"select" this hex
        highlightedHex = this;
        this.highlighted = true;
        //visually highlight the hex
        e.target.alpha = 1.3;

        if (hexFallAnimationTime > 0 || hexBreakAnimationTime > 0)
            return;

        //if we have dragged onto this hex
        if (dragStartHex != null && mouseHeldDown) {
            //search for this hex in the path
            let indexOfHexInPath = hexPath.indexOf(this);
            if (indexOfHexInPath == -1) {
                //if it hasnt been added to the path yet, then add it
                //if it is close enough to the currently selected hex
                if (Math.abs(hexPath[hexPath.length - 1].posX - this.posX) <= 2 && Math.abs(hexPath[hexPath.length - 1].posY - this.posY) <= 1) {
                    hexPath.push(this);
                }
            } else {
                //if it already is in the path, than truncate the path down to where this hex is
                hexPath.length = indexOfHexInPath + 1;
            }
        }
    }

    onMouseLeave(e) {
        highlightedHex = null;
        this.highlighted = false;
        e.currentTarget.alpha = 1.0;
    }


    //when the user clicks on this hexagon, start dragging the handle to the mouse positon
    onDragStart(e) {
        if (hexFallAnimationTime > 0 || hexBreakAnimationTime > 0)
            return;

        if (this == highlightedHex && dragStartHex == null) {
            console.log("DRAG START");
            dragStartHex = this;
            hexPath.push(this);
            mouseHeldDown = true;
        }
    }

    //when  the user stops dragging the handle
    //DEPRECIATED: use "onDragEnd(e)" in main.js, so it tracks for the whole window
    onDragEnd(e) {
        // console.log("DRAG END");
        // if(compareHexs(hexPath))
        // {
        //     for (let i = 0; i < hexPath.length ; i++) {
        //         for (let j = 0; j < hexArray.length ; j++) {
        //             if(hexPath[i] == hexArray[j])
        //             {
        //               //deletion of hex 
        //                 destroyedHexArray.push(hexArray[j]);
        //                 hexArray.splice(hexArray[j], 0);
        //                 hexArray[j].alpha = 0;
        //             }
        //         }
        //     }
        // }
        // dragStartHex = null;
        // hexPath = [];
        // mouseHeldDown = false;
    }

    //dragging the handle to the mouse positon
    onDragMove(e) {
        //console.log("DRAG MOVE")
    }

    checkIfFallable(){
        this.falling = false;
        if (this.posY != hexGridHeight - 1) {
            let belowHex = this.findHexBelow();

            if (belowHex == null) {
                hexFallAnimationTime = hexFallAnimationTimeMax;
                this.posX = this.belowPosX;
                this.posY++;
                this.falling = true;
            }else{
                this.falling = false;
            }
        }
    }


    findHexBelow() {
        //even row
        if (this.posY % 2 == 0) {
            this.belowX = getScreenSpaceX(this.posX + 1);
            this.belowY = getScreenSpaceY(this.posY + 1);
            this.belowPosX = this.posX + 1;
            return findHexAtPos(this.posX + 1, this.posY + 1);
        }
        //odd row
        else {
            this.belowX = getScreenSpaceX(this.posX - 1);
            this.belowY = getScreenSpaceY(this.posY + 1);
            this.belowPosX = this.posX - 1;
            return findHexAtPos(this.posX - 1, this.posY + 1);
        }

    }
}



class PathIndicator extends PIXI.Graphics {

    //inits this hexagon and stores its values
    constructor() {
        super();
        this.x = 0;
        this.y = 0;
        this.interactive = false;
        this.buttonMode = false;

    }

    drawLine() {
        this.beginFill();
        this.lineStyle({
            width: 11,
            color: 0xffffff,
            join: 'round',
            cap: 'round'
        });
        for (let i = 0; i < hexPath.length - 1; i++) {
            this.moveTo(hexPath[i].x, hexPath[i].y)
                .lineTo(hexPath[i + 1].x, hexPath[i + 1].y);
        }
        if (dragStartHex != null && highlightedHex == dragStartHex) {
            this.moveTo(dragStartHex.x, dragStartHex.y);
            this.lineTo(mousePosition.x, mousePosition.y);
        }
        else if (dragStartHex != null) {
            this.moveTo(hexPath[hexPath.length - 1].x, hexPath[hexPath.length - 1].y);
            this.lineTo(mousePosition.x, mousePosition.y);
        }
        this.endFill();
    }
}