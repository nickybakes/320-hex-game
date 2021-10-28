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

    //CCW = increase rotation value by 1
    //CW = decrease rotation value by 1

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

    hexDisplacementFilter;

    highlightOutlineBlinkTime;
    highlightOutlineBlinkTimeMax = 1;
    highlightOutlineValue;

    //stores values of hexagon
    hexagonValues;

    colorsRGB = [{ r: 180, g: 0, b: 0 }, { r: 189, g: 88, b: 0 }, { r: 191, g: 188, b: 0 }, { r: 0, g: 89, b: 0 }, { r: 0, g: 62, b: 196 }, { r: 78, g: 0, b: 99 }];
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

        this.hexDisplacementFilter = new PIXI.filters.DisplacementFilter(hexDisplacementSprite, 0);
        this.filters = [this.hexDisplacementFilter];
    }

    randomizeColors() {
        this.rotationValue = Math.trunc(Math.random() * 6);
        this.rotationValue = moveIntoRange(this.rotationValue, 0, 6);
        this.wantedRotationValue = this.rotationValue;
        this.colorIndices = [];
        this.hexagonValues = [];
        this.colorIndices = [Math.trunc(Math.random() * 6), Math.trunc(Math.random() * 6), Math.trunc(Math.random() * 6)];


        //This part assigns hexagonValues a value
        this.hexagonValues = [this.colorIndices[0], this.colorIndices[0], this.colorIndices[1], this.colorIndices[1], this.colorIndices[2], this.colorIndices[2]];

        this.clear();
        this.drawHex();
    }

    // Helper function to explicitly define hex colors, used in tutorial section
    setColorsAndRotation(color1, color2, color3, rotation) {
        this.rotationValue = rotation;
        this.rotationValue = moveIntoRange(this.rotationValue, 0, 6);
        this.wantedRotationValue = this.rotationValue;
        this.colorIndices = [];
        this.hexagonValues = [];
        this.colorIndices = [color1, color2, color3];


        //This part assigns hexagonValues a value
        this.hexagonValues = [this.colorIndices[0], this.colorIndices[0], this.colorIndices[1], this.colorIndices[1], this.colorIndices[2], this.colorIndices[2]];

        this.clear();
        this.drawHex();
    }

    rotateCW() {
        if (rotationCoolDown > 0 || hexFallAnimationTime > 0 || isInCountdown)
            return;

        if (this.currentRotationVelocity == 0) {
            rotationCoolDown = rotationCoolDownMax;
            this.wantedRotationValue -= 1;
            this.currentRotationVelocity = -this.absoluteRotationVelocity;
        }
    }

    rotateCCW() {
        if (rotationCoolDown > 0 || hexFallAnimationTime > 0 || isInCountdown)
            return;

        if (this.currentRotationVelocity == 0) {
            rotationCoolDown = rotationCoolDownMax;
            this.wantedRotationValue += 1;
            this.currentRotationVelocity = this.absoluteRotationVelocity;
        }
    }

    update() {
        if (this.falling && hexFallAnimationTime > 0) {
            this.x = lerp(this.x, this.belowX, (hexFallAnimationTimeMax - hexFallAnimationTime) / hexFallAnimationTimeMax);
            this.y = lerp(this.y, this.belowY, (hexFallAnimationTimeMax - hexFallAnimationTime) / hexFallAnimationTimeMax);
        }

        if (this.falling && hexFallAnimationTime <= 0) {

            this.x = this.belowX;
            this.y = this.belowY;
            this.falling = false;
        }

        if (hexFallAnimationTime > 0 || isInCountdown)
            return;

        if (highlightedHex == this) {
            this.hexDisplacementFilter.scale.x = (mousePosition.x - this.x) / 15;
            this.hexDisplacementFilter.scale.y = (mousePosition.y - this.y) / 15;
            if (this.highlightOutlineBlinkTime > 0) {
                this.highlightOutlineBlinkTime -= frameTime;
                this.highlightOutlineBlinkValue = Math.sin(rad(180 * (this.highlightOutlineBlinkTime / this.highlightOutlineBlinkTimeMax)));
            }

            if (this.highlightOutlineBlinkTime <= 0) {
                this.highlightOutlineBlinkTime = this.highlightOutlineBlinkTimeMax;
            }

            this.clear();
            this.drawHex();
        }

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

            this.rotationValue = moveIntoRange(this.rotationValue, 0, 6);
            this.wantedRotationValue = this.rotationValue;

            this.clear();
            this.drawHex();
        }
        else if (this.currentRotationVelocity < 0 && this.rotationValue - this.wantedRotationValue < 0) {
            this.rotationValue = this.wantedRotationValue;
            this.currentRotationVelocity = 0;

            this.rotationValue = moveIntoRange(this.rotationValue, 0, 6);
            this.wantedRotationValue = this.rotationValue;

            this.clear();
            this.drawHex();
        } else if (this.currentRotationVelocity != 0 && this.rotationValue == this.wantedRotationValue) {
            this.currentRotationVelocity = 0;
        }

    }

    drawHex() {
        this.beginFill();
        this.lineStyle(0);
        let bevelStartRadius = this.radius * .87;

        for (let i = 0; i < 6; i++) {
            if (this.highlighted) {

                this.beginFill(rgbToHex(255, lerp(0, 255, this.highlightOutlineBlinkValue), lerp(72, 255, this.highlightOutlineBlinkValue)));
                this.drawPolygon([
                    Math.sin(rad(60 * (i + this.rotationValue))) * (this.radius + 3.5), Math.cos(rad(60 * (i + this.rotationValue))) * (this.radius + 3.5),
                    Math.sin(rad(60 * (i + 1 + this.rotationValue))) * (this.radius + 3.5), Math.cos(rad(60 * (i + 1 + this.rotationValue))) * (this.radius + 3.5),
                    0, 0,
                ])
                this.endFill;
            }

            let brightnessEdge = Math.abs(moveIntoRange((i + this.rotationValue), -3, 3)) * 75 + 40;
            let brightnessClockWise = Math.abs(moveIntoRange((i + this.rotationValue) - 2, -3, 3)) * 75 + 20;
            let brightnessCounterClockWise = Math.abs(moveIntoRange((i + this.rotationValue) + 2, -3, 3)) * 75 + 20;
            let color = this.colorsRGB[this.colorIndices[Math.trunc(i / 2)]];

            let bevelEdgeColor = rgbToHex(color.r + (brightnessEdge - 128) * 1.6, color.g + (brightnessEdge - 128) * 1.6, color.b + (brightnessEdge - 128) * 1.6);
            let bevelClockwiseColor = rgbToHex(color.r + (brightnessClockWise - 128) * 1.6, color.g + (brightnessClockWise - 128) * 1.6, color.b + (brightnessClockWise - 128) * 1.6);
            let bevelCounterClockwiseColor = rgbToHex(color.r + (brightnessCounterClockWise - 128) * 1.6, color.g + (brightnessCounterClockWise - 128) * 1.6, color.b + (brightnessCounterClockWise - 128) * 1.6);

            //draw base triangle
            this.beginFill(rgbToHex(color.r * 1, color.g * .9, color.b * .9));
            this.drawPolygon([
                Math.sin(rad(60 * (i + this.rotationValue))) * this.radius, Math.cos(rad(60 * (i + this.rotationValue))) * this.radius,
                Math.sin(rad(60 * (i + 1 + this.rotationValue))) * this.radius, Math.cos(rad(60 * (i + 1 + this.rotationValue))) * this.radius,
                0, 0,
            ])
            this.endFill;


            if (i % 2 == 0) {
                //draw edge bevel
                this.beginFill(bevelEdgeColor);
                this.drawPolygon([
                    Math.sin(rad(60 * (i + this.rotationValue))) * this.radius, Math.cos(rad(60 * (i + this.rotationValue))) * this.radius,
                    Math.sin(rad(60 * (i + 1 + this.rotationValue))) * this.radius, Math.cos(rad(60 * (i + 1 + this.rotationValue))) * this.radius,
                    Math.sin(rad(60 * (i + 1 + this.rotationValue))) * (bevelStartRadius + 2), Math.cos(rad(60 * (i + 1 + this.rotationValue))) * (bevelStartRadius + 2),
                    Math.sin(rad(60 * (i + this.rotationValue + .08))) * bevelStartRadius, Math.cos(rad(60 * (i + this.rotationValue + .08))) * bevelStartRadius,
                ])
                this.endFill;

                //draw clockwise edge bevel
                this.beginFill(bevelClockwiseColor);
                this.drawPolygon([
                    Math.sin(rad(60 * (i + this.rotationValue))) * this.radius, Math.cos(rad(60 * (i + this.rotationValue))) * this.radius,
                    0, 0,
                    Math.sin(rad(60 * (i + this.rotationValue + 1))) * (this.radius - bevelStartRadius - 2), Math.cos(rad(60 * (i + this.rotationValue + 1))) * (this.radius - bevelStartRadius - 2),
                    Math.sin(rad(60 * (i + this.rotationValue + .08))) * bevelStartRadius, Math.cos(rad(60 * (i + this.rotationValue + .08))) * bevelStartRadius,
                ])
                this.endFill;

                //draw counter clockwise edge bevel
                this.beginFill(bevelCounterClockwiseColor);
                this.drawPolygon([
                    Math.sin(rad(60 * (i + 1 + this.rotationValue))) * this.radius, Math.cos(rad(60 * (i + 1 + this.rotationValue))) * this.radius,
                    0, 0,
                    Math.sin(rad(60 * (i + 1 + this.rotationValue - .1))) * (this.radius - bevelStartRadius), Math.cos(rad(60 * (i + 1 + this.rotationValue - .1))) * (this.radius - bevelStartRadius),
                    Math.sin(rad(60 * (i + 1 + this.rotationValue - .03))) * bevelStartRadius, Math.cos(rad(60 * (i + 1 + this.rotationValue - .03))) * bevelStartRadius,
                ])
                this.endFill;
            } else {
                //draw edge bevel
                this.beginFill(bevelEdgeColor);
                this.drawPolygon([
                    Math.sin(rad(60 * (i + this.rotationValue))) * this.radius, Math.cos(rad(60 * (i + this.rotationValue))) * this.radius,
                    Math.sin(rad(60 * (i + 1 + this.rotationValue))) * this.radius, Math.cos(rad(60 * (i + 1 + this.rotationValue))) * this.radius,
                    Math.sin(rad(60 * (i + 1 + this.rotationValue))) * (bevelStartRadius + 2), Math.cos(rad(60 * (i + 1 + this.rotationValue))) * (bevelStartRadius + 2),
                    Math.sin(rad(60 * (i + this.rotationValue))) * (bevelStartRadius + 2), Math.cos(rad(60 * (i + this.rotationValue))) * (bevelStartRadius + 2),
                ])
                this.endFill;

                //draw clockwise edge bevel
                this.beginFill(bevelClockwiseColor);
                this.drawPolygon([
                    Math.sin(rad(60 * (i + this.rotationValue))) * this.radius, Math.cos(rad(60 * (i + this.rotationValue))) * this.radius,
                    0, 0,
                    Math.sin(rad(60 * (i + this.rotationValue + .1))) * (this.radius - bevelStartRadius), Math.cos(rad(60 * (i + this.rotationValue + .1))) * (this.radius - bevelStartRadius),
                    Math.sin(rad(60 * (i + this.rotationValue + .03))) * bevelStartRadius, Math.cos(rad(60 * (i + this.rotationValue + .03))) * bevelStartRadius,
                ])
                this.endFill;

                //draw counter clockwise edge bevel
                this.beginFill(bevelCounterClockwiseColor);
                this.drawPolygon([
                    Math.sin(rad(60 * (i + 1 + this.rotationValue))) * this.radius, Math.cos(rad(60 * (i + 1 + this.rotationValue))) * this.radius,
                    0, 0,
                    Math.sin(rad(60 * (i + this.rotationValue))) * (this.radius - bevelStartRadius - 2), Math.cos(rad(60 * (i + this.rotationValue))) * (this.radius - bevelStartRadius - 2),
                    Math.sin(rad(60 * (i + 1 + this.rotationValue - .08))) * bevelStartRadius, Math.cos(rad(60 * (i + 1 + this.rotationValue - .08))) * bevelStartRadius,
                ])
                this.endFill;



                if (showHexIcons) {
                    let iconIndex = this.colorIndices[Math.trunc(i / 2)];
                    let iconCenterX = Math.sin(rad(60 * (i + this.rotationValue))) * (this.radius / 2);
                    let iconCenterY = Math.cos(rad(60 * (i + this.rotationValue))) * (this.radius / 2);
                    this.beginFill(rgbToHex(color.r - 140.8, color.g - 140.8, color.b - 140.8));

                    if (iconIndex == 0) {
                        this.drawPolygon([
                            iconCenterX, iconCenterY - 2.5,
                            iconCenterX - 5, iconCenterY - 7.5,
                            iconCenterX - 12.5, iconCenterY,
                            iconCenterX, iconCenterY + 12.5,
                            iconCenterX + 12.5, iconCenterY,
                            iconCenterX + 5, iconCenterY - 7.5,
                            iconCenterX, iconCenterY - 2.5,

                            //1.5x larger
                            // iconCenterX, iconCenterY - 3,
                            // iconCenterX - 6, iconCenterY - 9,
                            // iconCenterX - 15, iconCenterY,
                            // iconCenterX, iconCenterY + 15,
                            // iconCenterX + 15, iconCenterY,
                            // iconCenterX + 6, iconCenterY - 9,
                            // iconCenterX, iconCenterY - 3,
                        ])
                    }
                    else if (iconIndex == 1) {
                        this.drawPolygon([
                            iconCenterX - 12, iconCenterY - 12,
                            iconCenterX + 4, iconCenterY,
                            iconCenterX - 6, iconCenterY + 4,
                        ])

                        this.drawPolygon([
                            iconCenterX - 10, iconCenterY + 8,
                            iconCenterX + 8, iconCenterY,
                            iconCenterX + 10, iconCenterY + 2,
                            iconCenterX - 8, iconCenterY + 10,
                        ])

                        this.drawPolygon([
                            iconCenterX - 1, iconCenterY + 9,
                            iconCenterX + 4, iconCenterY + 6,
                            iconCenterX + 7, iconCenterY + 10,
                            iconCenterX + 2, iconCenterY + 13,
                        ])
                    }
                    else if (iconIndex == 2) {
                        this.drawCircle(iconCenterX, iconCenterY - 6, 7);
                        this.drawCircle(iconCenterX - 6, iconCenterY + 4, 7);
                        this.drawCircle(iconCenterX + 6, iconCenterY + 4, 7);
                    }
                    else if (iconIndex == 3) {
                        this.lineStyle({
                            width: 3
                        });
                        this.moveTo(iconCenterX, iconCenterY);
                        for (let q = 0; q < 720; q += 60) {
                            this.moveTo(iconCenterX + Math.sin(rad(q)) * (q / 50), iconCenterY + Math.cos(rad(q)) * (q / 50));
                            this.lineTo(iconCenterX + Math.sin(rad(q + 60)) * ((q + 60) / 50), iconCenterY + Math.cos(rad(q + 60)) * ((q + 60) / 50));
                        }
                        this.lineStyle(0);
                    }
                    else if (iconIndex == 4) {
                        this.drawStar(iconCenterX, iconCenterY, 4, 14, 4.7, 0);
                    }
                    else if (iconIndex == 5) {
                        this.drawEllipse(iconCenterX, iconCenterY + 2, 14, 5);
                        this.drawPolygon([
                            iconCenterX - 6, iconCenterY + 2,
                            iconCenterX + 6, iconCenterY + 2,
                            iconCenterX, iconCenterY - 16,
                        ])
                    }
                    this.endFill;
                }
            }


            // this.lineStyle(3, bevelEdgeColor);
            // this.moveTo(Math.sin(rad(60 * (i + this.rotationValue))) * this.radius, Math.cos(rad(60 * (i + this.rotationValue))) * this.radius)
            //     .lineTo(Math.sin(rad(60 * (i + 1 + this.rotationValue))) * this.radius, Math.cos(rad(60 * (i + 1 + this.rotationValue))) * this.radius);
        }

        this.endFill();
    }

    //when the user clicks on this hexagon, start dragging the handle to the mouse positon
    //if they enter the hex while dragging the handle, add this hex to the path if it follows conditions
    onMouseEnter(e) {
        //"select" this hex
        highlightedHex = this;
        this.highlighted = true;
        this.highlightOutlineBlinkTime = this.highlightOutlineBlinkTimeMax;
        //visually highlight the hex
        //e.target.alpha = 1.5;

        if (hexFallAnimationTime > 0 || hexBreakAnimationTime > 0 || isInCountdown)
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
            } else if (this == dragStartHex && hexPath.length > 2 && compareHexes(hexPath)) {
                //if we drag back onto the starting hex, and its a complete path,
                //then "connect" the path line to itself
                connectPathToStart = true;
            }
            else {
                //if it already is in the path, than truncate the path down to where this hex is
                hexPath.length = indexOfHexInPath + 1;
            }
        }
        this.clear();
        this.drawHex();
    }

    onMouseLeave(e) {
        highlightedHex = null;
        this.highlighted = false;
        //e.currentTarget.alpha = 1.0;

        this.hexDisplacementFilter.scale.x = 0;
        this.hexDisplacementFilter.scale.y = 0;

        if (this == dragStartHex) {
            connectPathToStart = false;
        }
        this.clear();
        this.drawHex();
    }


    //when the user clicks on this hexagon, start dragging the handle to the mouse positon
    onDragStart(e) {
        if (hexFallAnimationTime > 0 || hexBreakAnimationTime > 0 || isInCountdown)
            return;

        if (this == highlightedHex && dragStartHex == null) {
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

    checkIfFallable() {
        this.falling = false;
        if (this.posY != hexGridHeight - 1) {
            let belowHex = this.findHexBelow();

            if (belowHex == null) {
                hexFallAnimationTime = hexFallAnimationTimeMax;
                this.posX = this.belowPosX;
                this.posY++;
                this.falling = true;
            } else {
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
    lineWidth;
    lineColor;

    // highlightOutlineBlinkTime;
    // highlightOutlineBlinkTimeMax = 1;
    // highlightOutlineValue;

    //inits this hexagon and stores its values
    constructor(lineWidth = 11, alpha = 1, lineColor = 0xaaaaaa) {
        super();
        this.x = 0;
        this.y = 0;
        this.interactive = false;
        this.buttonMode = false;
        this.padding = 20;
        this.lineWidth = lineWidth;
        this.alpha = alpha;
        this.lineColor = lineColor;
        // this.highlightOutlineBlinkTime = this.highlightOutlineBlinkTimeMax;

    }

    drawLine() {

        // if (this.highlightOutlineBlinkTime > 0) {
        //     this.highlightOutlineBlinkTime -= frameTime;
        //     this.highlightOutlineBlinkValue = Math.sin(rad(180 * (this.highlightOutlineBlinkTime / this.highlightOutlineBlinkTimeMax)));
        // }

        // if (this.highlightOutlineBlinkTime <= 0) {
        //     this.highlightOutlineBlinkTime = this.highlightOutlineBlinkTimeMax;
        // }

        this.beginFill();
        // if (this.lineColor != 0xffffff) {
        //     this.lineStyle({
        //         width: this.lineWidth,
        //         color: rgbToHex(255, lerp(0, 255, this.highlightOutlineBlinkValue), lerp(72, 255, this.highlightOutlineBlinkValue)),
        //         join: 'round',
        //         cap: 'round'
        //     });
        // }
        // else {
        //     this.lineStyle({
        //         width: this.lineWidth,
        //         color: 0xffffff,
        //         join: 'round',
        //         cap: 'round'
        //     });
        // }

        this.lineStyle({
            width: this.lineWidth,
            color: this.lineColor,
            join: 'round',
            cap: 'round'
        });
        for (let i = 0; i < hexPath.length - 1; i++) {
            this.moveTo(hexPath[i].x, hexPath[i].y)
                .lineTo(hexPath[i + 1].x, hexPath[i + 1].y);
        }
        if (dragStartHex != null && highlightedHex == dragStartHex && hexPath.length == 1) {
            this.moveTo(dragStartHex.x, dragStartHex.y);
            this.lineTo(mousePosition.x, mousePosition.y);
        }
        else if (!connectPathToStart && dragStartHex != null) {
            this.moveTo(hexPath[hexPath.length - 1].x, hexPath[hexPath.length - 1].y);
            this.lineTo(mousePosition.x, mousePosition.y);
        }
        else if (connectPathToStart && dragStartHex != null) {
            for (let i = 0; i < 8; i += 3) {
                let x1 = lerp(hexPath[hexPath.length - 1].x, dragStartHex.x, i / 8);
                let y1 = lerp(hexPath[hexPath.length - 1].y, dragStartHex.y, i / 8);
                let x2 = lerp(hexPath[hexPath.length - 1].x, dragStartHex.x, (i + 1) / 8);
                let y2 = lerp(hexPath[hexPath.length - 1].y, dragStartHex.y, (i + 1) / 8);

                this.moveTo(x1, y1);
                this.lineTo(x2, y2);
            }
        }
        this.endFill();
    }
}

//Draws a big pink X that blinks for a small bit
class WrongMoveIndicator extends PIXI.Graphics {
    currentBlinkTime;

    currentBlinkTimeMax = .25;

    currentBlinkAmount;

    currentBlinkAmountMax = 3;

    radius = 35;

    //inits this hexagon and stores its values
    constructor() {
        super();
        this.x = 0;
        this.y = 0;
        this.interactive = false;
        this.buttonMode = false;
        this.currentBlinkAmount = this.currentBlinkAmountMax;
        this.alpha = 0;

        //draws white outline
        this.beginFill();
        this.lineStyle({
            width: 47,
            color: 0xffffff,
            join: 'round',
            cap: 'round'
        });
        this.moveTo(-this.radius, -this.radius)
            .lineTo(this.radius, this.radius);
        this.moveTo(this.radius, -this.radius)
            .lineTo(-this.radius, this.radius);

        //draws black outline
        this.beginFill();
        this.lineStyle({
            width: 42,
            color: 0x000000,
            join: 'round',
            cap: 'round'
        });
        this.moveTo(-this.radius, -this.radius)
            .lineTo(this.radius, this.radius);
        this.moveTo(this.radius, -this.radius)
            .lineTo(-this.radius, this.radius);

        //draws dark pink outline
        this.lineStyle({
            width: 29,
            color: 0xa80030,
            join: 'round',
            cap: 'round'
        });
        this.moveTo(-this.radius, -this.radius)
            .lineTo(this.radius, this.radius);
        this.moveTo(this.radius, -this.radius)
            .lineTo(-this.radius, this.radius);

        //draws pink X shape
        this.lineStyle({
            width: 15,
            color: 0xff0048,
            join: 'round',
            cap: 'round'
        });
        this.moveTo(-this.radius, -this.radius)
            .lineTo(this.radius, this.radius);
        this.moveTo(this.radius, -this.radius)
            .lineTo(-this.radius, this.radius);

        this.endFill();
    }

    update() {
        if (this.currentBlinkTime > 0) {
            this.currentBlinkTime -= frameTime;
            this.alpha = Math.sin(rad(180 * (this.currentBlinkTime / this.currentBlinkTimeMax)));
        }

        if (this.currentBlinkTime <= 0) {
            this.currentBlinkAmount++;
            this.currentBlinkTime = this.currentBlinkTimeMax;
        }
    }

    drawMarker() {

    }
}

//A system that draws and moves polygons when a hex is broken so it
//looks like it visually exploded
class HexBreakParticleSystem extends PIXI.Graphics {

    colorsRGB = [{ r: 255, g: 0, b: 0 }, { r: 245, g: 139, b: 0 }, { r: 255, g: 208, b: 0 }, { r: 0, g: 145, b: 0 }, { r: 0, g: 110, b: 255 }, { r: 116, g: 0, b: 184 }, { r: 168, g: 168, b: 168 }, { r: 255, g: 244, b: 122 }, { r: 255, g: 0, b: 128 }];

    brokenPieces = [];

    gravity = 1200;

    currentLifeTime;

    currentLifeTimeMax = 2;


    //inits this particle system and stores its values
    constructor(x, y, colorIndex1, colorIndex2, colorIndex3) {
        super();
        this.x = x;
        this.y = y;
        this.interactive = false;
        this.buttonMode = false;

        this.currentLifeTime = this.currentLifeTimeMax;

        let colorIndices = [colorIndex1, colorIndex2, colorIndex3];

        //set up broken pieces
        let numBrokenPieces = Math.trunc(clamp(Math.random(), .4, 1) * 30);

        for (let i = 0; i < numBrokenPieces; i++) {
            this.brokenPieces.push({
                x: Math.trunc((Math.random() - .5) * 50 * 2),
                y: Math.trunc((Math.random() - .5) * 50 * 2),
                velX: Math.trunc((Math.random() - .5) * 600 * 2),
                velY: Math.trunc((Math.random() - .2) * -600 * 2),
                colorIndex: colorIndices[Math.trunc(Math.random() * 3)],
                brightness: Math.trunc((Math.random() - .5) * 30 * 2),
                flashChance: Math.random(),
                rotationDegrees: Math.trunc(clamp(Math.random(), .2, .8) * 360),
                radius: Math.trunc(clamp(Math.random(), .4, 1) * 24),
                rotationalVelocity: Math.trunc((Math.random() - .5) * 1100 * 2),
                brightnessFlashSpeed: 0
            });
            this.brokenPieces[i].brightnessFlashSpeed = Math.trunc(clamp(Math.random(), .8, 1) * this.brokenPieces[i].rotationalVelocity * 2);
        }
    }

    update() {
        this.currentLifeTime -= frameTime;
        for (let i = 0; i < this.brokenPieces.length; i++) {
            let brokenPiece = this.brokenPieces[i];

            brokenPiece.velY += this.gravity * frameTime;

            brokenPiece.x += brokenPiece.velX * frameTime;
            brokenPiece.y += brokenPiece.velY * frameTime;

            if (brokenPiece.brightness >= 150 || brokenPiece.brightness <= -150) {
                brokenPiece.brightness = clamp(brokenPiece.brightness, -148, 148);
                brokenPiece.brightnessFlashSpeed = -brokenPiece.brightnessFlashSpeed;
            }

            if (brokenPiece.flashChance > .6)
                brokenPiece.brightness += brokenPiece.brightnessFlashSpeed * frameTime;

            brokenPiece.rotationDegrees += brokenPiece.rotationalVelocity * frameTime;
        }
    }

    drawParticleSystem() {
        this.clear();
        for (let i = 0; i < this.brokenPieces.length; i++) {
            let brokenPiece = this.brokenPieces[i];
            let color = this.colorsRGB[brokenPiece.colorIndex];

            this.beginFill(rgbToHex(color.r + brokenPiece.brightness, color.g + brokenPiece.brightness, color.b + brokenPiece.brightness));
            this.drawPolygon([
                brokenPiece.x + Math.sin(rad(brokenPiece.rotationDegrees)) * brokenPiece.radius, brokenPiece.y + Math.cos(rad(brokenPiece.rotationDegrees)) * brokenPiece.radius,
                brokenPiece.x + Math.sin(rad(120 + brokenPiece.rotationDegrees)) * brokenPiece.radius, brokenPiece.y + Math.cos(rad(120 + brokenPiece.rotationDegrees)) * brokenPiece.radius,
                brokenPiece.x + Math.sin(rad(240 + brokenPiece.rotationDegrees)) * brokenPiece.radius, brokenPiece.y + Math.cos(rad(240 + brokenPiece.rotationDegrees)) * brokenPiece.radius
            ])
            this.endFill();
        }
    }
}