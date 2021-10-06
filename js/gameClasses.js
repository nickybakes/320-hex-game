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

        this.colorsRGB;
        //let colors = [rgbToHex(255, 0, 0), rgbToHex(245, 139, 0), rgbToHex(255, 208, 0), rgbToHex(0, 145, 0), rgbToHex(0, 110, 255), rgbToHex(116, 0, 184)];
        this.colorIndices = [Math.trunc(Math.random() * 6), Math.trunc(Math.random() * 6), Math.trunc(Math.random() * 6)];
       
        //This part assigns hexagonValues a value
        this. hexagonValues = giveHexValue(this.rotationValue, this.colorIndices);
        
        this.drawHex();

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

    rotateCW(){
        if(this.currentRotationVelocity == 0){
            this.wantedRotationValue -= 1;
            this.currentRotationVelocity = -this.absoluteRotationVelocity;
            this.hexagonValues.push(this.hexagonValues[0]);
            this.hexagonValues.shift(this.hexagonValues[0]);
        }
    }

    rotateCCW() {
        if (this.currentRotationVelocity == 0) {
            this.wantedRotationValue += 1;
            this.currentRotationVelocity = this.absoluteRotationVelocity;
            this.hexagonValues.unshift(this.hexagonValues[this.hexagonValues.length-1]);
            this.hexagonValues.pop(this.hexagonValues[this.hexagonValues.length-1]);
        }
    }

    update(){
        if(this.currentRotationVelocity > 0 && this.wantedRotationValue - this.rotationValue > 0){
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
            this.clear();
            this.drawHex();
        }
        else if (this.currentRotationVelocity < 0 && this.rotationValue - this.wantedRotationValue < 0) {
            this.rotationValue = this.wantedRotationValue;
            this.currentRotationVelocity = 0;
            this.clear();
            this.drawHex();
        } else if (this.currentRotationVelocity != 0 && this.rotationValue == this.wantedRotationValue){
            this.currentRotationVelocity = 0;
        }

    }

    drawHex(){
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
    onMouseEnter(e) {
        if (this.alpha == 0) {
            return;
        }
        highlightedHex = this;
        this.highlighted = true;
        if (dragStartHex != null && mouseHeldDown) {
            let indexOfHexInPath = hexPath.indexOf(this);
            if (indexOfHexInPath == -1) {
                hexPath.push(this);
            } else {
                hexPath.length = indexOfHexInPath + 1;
            }
        }
        e.target.alpha = 1.5;
    }

    onMouseLeave(e) {
        if (this.alpha == 0) {
            return;
        }
        highlightedHex = null;
        this.highlighted = false;
        e.currentTarget.alpha = 1.0;
    }
    

    //when the user clicks on this hexagon, start dragging the handle to the mouse positon
    onDragStart(e) {
        if (this == highlightedHex && dragStartHex == null) {
            console.log("DRAG START");
            dragStartHex = this;
            hexPath.push(this);
            mouseHeldDown = true;
        }
    }

    //when  the user stops dragging the handle
    onDragEnd(e) {
        console.log("DRAG END");
        if(compareHexs(hexPath))
        {
            for (let i = 0; i < hexPath.length ; i++) {
                for (let j = 0; j < hexArray.length ; j++) {
                    if(hexPath[i] == hexArray[j])
                    {
                      //deletion of hex 
                        destroyedHexArray.push(hexArray[j]);
                        hexArray.splice(hexArray[j], 0);
                        hexArray[j].alpha = 0;
                    }
                }
            }
        }
        dragStartHex = null;
        hexPath = [];
        mouseHeldDown = false;

    }

    //dragging the handle to the mouse positon
    onDragMove(e) {
        //console.log("DRAG MOVE")
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
            color: 0xffffff
        });
        for (let i = 0; i < hexPath.length - 1; i++) {
            this.moveTo(hexPath[i].x, hexPath[i].y)
                .lineTo(hexPath[i + 1].x, hexPath[i + 1].y)
        }
        if (dragStartHex != null && highlightedHex == dragStartHex) {
            this.moveTo(dragStartHex.x, dragStartHex.y);
            this.lineTo(mousePosition.x, mousePosition.y);
        }
        if (dragStartHex != null && highlightedHex != null) {
            this.moveTo(highlightedHex.x, highlightedHex.y);
            this.lineTo(mousePosition.x, mousePosition.y);
        }
        this.endFill();
    }
}