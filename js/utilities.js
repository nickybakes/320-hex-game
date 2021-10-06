//forces a value in between a min and max and returns it
function clamp(val, min, max) {
    return val < min ? min : (val > max ? max : val);
}

//interpolate a value between 2 points
function lerp(start, end, amt) {
    return start * (1 - amt) + amt * end;
}

//interpolates a value clamped between 2 points 
function lerpClamped(start, end, amt) {
    return start * (1 - clamp(amt, 0, 1)) + clamp(amt, 0, 1) * end;
}

//takes bilinear coords UV, and interps between 4 values
function bilinearInterp(uv, a, b, c, d) {
    return lerp(lerp(d, a, uv.y), lerp(c, b, uv.y), uv.x);
}

//takes a value, moves it into a range of 2 other values by either adding or subtracting the range and returns it
function moveIntoRange(val, min, max) {
    let diff = max - min;
    while (val < min) {
        val += diff;
    }
    while (val >= max) {
        val -= diff;
    }
    return val;
}

//converts degrees to radians
function rad(deg) {
    return deg * Math.PI / 180;
}

//converts radians to degrees
function deg(rad) {
    return rad * 180 / Math.PI;
}

//gets the area of a triangle defined by 2D points a, b, and c
function areaOfTriangle(a, b, c) {
    return Math.abs((a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y)) / 2);
}

//gets the distance between 2 2d points
function dist(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

//gets the non-squareroot distance between 2 2d points
function distSquared(x1, y1, x2, y2) {
    return Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2);
}

//gets the average of 2 values
function average(a, b) {
    return (a + b) / 2;
}

//converts an amount of seconds into a string of MM:SS.ZZZ (Z = milliseconds)
function secondsToTimeString(seconds){
    //clamp to 99 minutes and 59 seconds
    seconds = clamp(seconds, 0, 5549.999);
    //use javascript date to parse our seconds value as time
    let date = new Date(null);
    date.setSeconds(seconds, (seconds - parseInt(seconds))*1000);
    //limit it to just the minutes, seconds, and milliseconds
    let timeString = date.toISOString().substr(14, 9);
    //return the result
    return timeString;
}

function rgbToHex(red = 0, green = 0, blue = 0) {
    let redHex = Number(Math.trunc(clamp(red, 0, 255))).toString(16);
    if (redHex.length < 2) {
        redHex = "0" + redHex;
    }
    let greenHex = Number(Math.trunc(clamp(green, 0, 255))).toString(16);
    if (greenHex.length < 2) {
        greenHex = "0" + greenHex;
    }
    let blueHex = Number(Math.trunc(clamp(blue, 0, 255))).toString(16);
    if (blueHex.length < 2) {
        blueHex = "0" + blueHex;
    }
    return "0x" + redHex + greenHex + blueHex;
};

function hexToRed(red){
    return parseInt(red, 16);
}

function multiplyColorsConvertToHex(redA, greenA, blueA, redB, greenB, blueB){
    let r = redA * (redB/255);
    let g = greenA * (greenB / 255);
    let b = blueA * (blueB / 255);
    return rgbToHex(r, g, b);
}

function blendColorsConvertToHex(redA, greenA, blueA, redB, greenB, blueB, alphaA, alphaB) {
    let r = redB * (redB / 255) + redA * alphaA * (1 - alphaB) / 255;
    let g = greenB * (greenB / 255) + greenA * alphaA * (1 - alphaB) / 255;
    let b = blueB * (blueB / 255) + blueA * alphaA * (1 - alphaB) / 255;
    return rgbToHex(r, g, b);
}

//Compares the tile values of each hexagon in the line to see if they all match up 
//I am to stupid to make this a switch statement, if someone smarter than me could do that, that would be gretaly appreciated
function compareHexs(hexPath) {
    validPathChecker = [null];

    for (let i = 0; i < hexPath.length - 1; i++) {
        if (hexPath[i].posX > hexPath[i + 1].posX && hexPath[i].posY == hexPath[i + 1].posY) {
            if (hexPath[i].hexagonValues[4] == hexPath[i + 1].hexagonValues[1]) {
                validPathChecker[i] = true;
            } else {
                validPathChecker[i] = false;
            }
        } else if (hexPath[i].posX < hexPath[i + 1].posX && hexPath[i].posY == hexPath[i + 1].posY) {
            if (hexPath[i].hexagonValues[1] == hexPath[i + 1].hexagonValues[4]) {
                validPathChecker[i] = true;
            } else {
                validPathChecker[i] = false;
            }
        } else if (hexPath[i].posX > hexPath[i + 1].posX && hexPath[i].posY > hexPath[i + 1].posY) {
            if (hexPath[i].hexagonValues[3] == hexPath[i + 1].hexagonValues[0]) {
                validPathChecker[i] = true;
            } else {
                validPathChecker[i] = false;
            }
        } else if (hexPath[i].posX < hexPath[i + 1].posX && hexPath[i].posY < hexPath[i + 1].posY) {
            if (hexPath[i].hexagonValues[0] == hexPath[i + 1].hexagonValues[3]) {
                validPathChecker[i] = true;
            } else {
                validPathChecker[i] = false;
            }
        } else if (hexPath[i].posX > hexPath[i + 1].posX && hexPath[i].posY < hexPath[i + 1].posY) {
            if (hexPath[i].hexagonValues[5] == hexPath[i + 1].hexagonValues[2]) {
                validPathChecker[i] = true;
            } else {
                validPathChecker[i] = false;
            }
        } else if (hexPath[i].posX < hexPath[i + 1].posX && hexPath[i].posY > hexPath[i + 1].posY) {
            if (hexPath[i].hexagonValues[2] == hexPath[i + 1].hexagonValues[5]) {
                validPathChecker[i] = true;
            } else {
                validPathChecker[i] = false;
            }
        } else {
            console.log("broken");
        }
    }
        
    for (let element of validPathChecker) {
        if (element == false || element == null) {
            console.log("false");
            return false;
        }
        
    }

    console.log("true");
    return true;
}

function giveHexValue(rotation, colorIndices) {
    
    switch (rotation) {
    case 0:
        return [colorIndices[0], colorIndices[0], colorIndices[1], colorIndices[1], colorIndices[2], colorIndices[2]];
    case 1:
        return [colorIndices[2], colorIndices[0], colorIndices[0], colorIndices[1], colorIndices[1], colorIndices[2]];
        
    case 2:
        return [colorIndices[2], colorIndices[2], colorIndices[0], colorIndices[0], colorIndices[1], colorIndices[1]];
        
    case 3:
        return [colorIndices[1], colorIndices[2], colorIndices[2], colorIndices[0], colorIndices[0], colorIndices[1]];
        
    case 4:
        return [colorIndices[1], colorIndices[1], colorIndices[2], colorIndices[2], colorIndices[0], colorIndices[0]];
        
    case 5:
        return [colorIndices[0], colorIndices[1], colorIndices[1], colorIndices[2], colorIndices[2], colorIndices[0]];
    }
    
}

