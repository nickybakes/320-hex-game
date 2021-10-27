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
function secondsToTimeString(seconds) {
    //clamp to 99 minutes and 59 seconds
    seconds = clamp(seconds, 0, 5549.999);
    //use javascript date to parse our seconds value as time
    let date = new Date(null);
    date.setSeconds(seconds, (seconds - parseInt(seconds)) * 1000);
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

function hexToRed(red) {
    return parseInt(red, 16);
}

function multiplyColorsConvertToHex(redA, greenA, blueA, redB, greenB, blueB) {
    let r = redA * (redB / 255);
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

//checks the Path of hexes the player made
function compareHexes(hexPath) {
    let positionDifferences = [
        { x: 1, y: 1 }, { x: 2, y: 0 }, { x: 1, y: -1 }, { x: -1, y: -1 }, { x: -2, y: 0 }, { x: -1, y: 1 }
    ];

    if (hexPath.length <= 1)
        return false;

    for (let i = 0; i < hexPath.length - 1; i++) {
        let startIndexHexCurrent = moveIntoRange(hexPath[i].wantedRotationValue, 0, 6);
        let startIndexHexNext = moveIntoRange(hexPath[i + 1].wantedRotationValue, 0, 6);
        for(let j = 0; j < 6; j++){
            if (hexPath[i + 1].posX - hexPath[i].posX == positionDifferences[j].x && hexPath[i + 1].posY - hexPath[i].posY == positionDifferences[j].y){
                //j represents the index of the segment of the FIRST (current) hex we want to compare to with the next one
                //j + 3 (but moved into range 0 - 6 not including 6) represents the segment we want to use on the NEXT hex in the path
                //we add j to both of the hexes' "startIndex" which is based on its rotational value, so that we are checking
                //the segment after rotating, with out having to physically shift the data in the arrays (which is prone to cause bugs)

                //NOTE: j also represents the direction the path is moving between 2 hexes (which is why we know which segments need to be compared,
                //for example if the path is going down right (j = 5), then we have to compare bottom left segment of top hex and top right segment of bottom hex).

                //Knowing that j represents the direction of the path, we can use it to find shapes drawn within the path, maybe add j to a list and for every
                //hex we check, we see if the list of j's (directions) is the same needed for a shape. If one j breaks the shape, then we clea rthat list and start again

                //if the 2 segments dont match, then we return false!
                if (hexPath[i].hexagonValues[moveIntoRange(j - startIndexHexCurrent, 0, 6)] != hexPath[i + 1].hexagonValues[moveIntoRange(j - startIndexHexNext + 3, 0, 6)]){
                    wrongMovePositionAndDirection = {
                        posX: hexPath[i].posX,
                        posY: hexPath[i].posY,
                        directionX: positionDifferences[j].x,
                        directionY: positionDifferences[j].y
                    };
                    return false;
                }
            }
        }
    }
    //if no "non matches" were found in the path, then the path must be good, and we can return True!
    return true;
}

//Figures out if a shape has been drawn by the player when they get a correct match
function detectShape(hexPath) {
    //copy path made by player
    let relativePath = [];
    startx = hexPath[0].posX
    starty = hexPath[0].posY
    for (let i = 0; i < hexPath.length - 1; i++) {
        relativePath.push([hexPath[i + 1].posX - hexPath[i].posX, hexPath[i + 1].posY - hexPath[i].posY])
    }
    
    //run it through all the possible shapes

    //triangle destorys a random row
    if (detectTriangle(relativePath)) {
        let randomY = Math.floor(Math.random() * 6)
        switch (randomY % 2) {
        case 0:
            for (let i = 0; i < 12; i += 2) {
                hex = findHexAtPos(i, randomY)
                if (hex != null) {
                    breakHex(hex);
                }
            }
            break;
        case 1:
            for (let i = 1; i < 12; i += 2) {
                hex = findHexAtPos(i, randomY)
                if (hex != null) {
                    breakHex(hex);
                }
            }
            
        }
    }

    //lightning destroys 3 random tiles
    if (detectLightning(relativePath)) {
        for (let i = 0; i < 4; i++) {
            let randomX = Math.floor(Math.random() * 12)
            let randomY = Math.floor(Math.random() * 6)
            hex = findHexAtPos(randomX, randomY)
            while (hex == null) {
                randomX = Math.floor(Math.random() * 12)
                randomY = Math.floor(Math.random() * 6)
                hex = findHexAtPos(randomX, randomY)
            }
            breakHex(hex);
        }
    }

    //W destroys a random row
    if (detectW(relativePath)) {
        let randomX = Math.floor(Math.random() * 12)
        console.log(randomX);
        for (let i = 0; i < 6; i++) {
            hex = findHexAtPos(randomX, i)
            if (hex != null) {
                breakHex(hex);
            }
        }
    }
    
    //Trapezoid does a cool diagonal thing along the sides (WIP)
    if (detectTrapezoid(relativePath)) {
        let maxLeft = hexPath[0].posX;
        let maxRight = hexPath[0].posX;
        let startY = hexPath[0].posY;
        for (let i = 0; i < hexPath.length - 1; i++) {
            if (hexPath[i].posX > maxRight) {
                maxRight = hexPath[i].posX;
            }
            if (hexPath[i].posX < maxLeft) {
                maxLeft = hexPath[i].posX;
            }
            if (hexPath[i].posY > startY) {
                startY = hexPath[i].posY;
            }
        }
        
        let hexL = findHexAtPos(maxRight, startY);
        let hexR = findHexAtPos(maxLeft, startY);
        
        for (let i = 1; i < 12; i++) {
            
            if (hexR != null) {
                if (hexR.posX != 12) {
                    hexR = findHexAtPos(maxRight + i, startY + i)
                    if (hexR != null) {
                        breakHex(hexR);
                    }
                }
            }
            if (hexL != null) {
                if (hexL.posX != 0) {
                    hexL = findHexAtPos(maxLeft - i, startY + i)
                    if (hexL != null) {
                        breakHex(hexL);
                    }
                }
            }
        }
        
    }
    
    //IDK what should happen
    if(detectPentagram(relativePath))
    {

    }

    //If you do the cool infinity thing destroy all tiles
    if (detectInfinity(relativePath)) {
        comboPoints += 12;
        breakAllHexes();
    }
}

//checks path made by player and sees if it follows any triangel patterns
function detectTriangle(relativePath)
{
    let possibleTriangles = [
        [[-1,1],[2,0]],
        [[1,1],[-2,0]],  
        [[1,-1],[1,1]],
        [[2,0],[-1,-1]],
        [[-1,-1],[-1,1]],
        [[-2,0],[1,-1]],  
        [[2,0],[-1,1]],   
        [[-2,0],[1,1]],
        [[-1,-1],[2,0]],
        [[1,-1],[-2,0]],
        [[1,1],[1,-1]],
        [[-1,1],[-1,-1]],
    ];
   for(let i = 0; i < possibleTriangles.length; i++)
   {
    if(equalArray(relativePath,possibleTriangles[i]))
    { 
        return true;
    }
   }
}

//checks path made by player and sees if it follows any pentagram patterns
function detectPentagram(relativePath)
{
    let possiblePentagram = [
        [[-2, 0] , [-1, 1] , [1, 1] , [2, 0] , [1, -1]],
        [[-1, 1] , [1, 1] , [2, 0] , [1, -1] , [-1, -1]],
        [[1, 1] , [2, 0] , [1, -1] , [-1, -1] , [-2, 0]],
        [[2, 0] , [1, -1] , [-1, -1] , [-2, 0] , [-1, 1]],
        [[1, -1] , [-1, -1] , [-2, 0] , [-1, 1] , [1, 1]],
        [[-1, -1] , [-2, 0] , [-1, 1] , [1, 1] , [2, 0]],
        [[1, 1] , [-1, 1] , [-2, 0] , [-1, -1] , [1, -1]],
        [[-1, 1] , [-2, 0] , [-1, -1] , [1, -1] , [2, 0]],
        [[-2, 0] , [-1, -1] , [1, -1] , [2, 0] , [1, 1]],
        [[-1, -1] , [1, -1] , [2, 0] , [1, 1] , [-1, 1]],
        [[1, -1] , [2, 0] , [1, 1] , [-1, 1] , [-2, 0]],
        [[2, 0] , [1, 1] , [-1, 1] , [-2, 0] , [-1, -1]]
    ];
   for(let i = 0; i < possiblePentagram.length; i++)
   {
    if(equalArray(relativePath,possiblePentagram[i]))
    {
        return true;
    }
   }
}

//checks path made by player and sees if it follows any lightning patterns
function detectLightning(relativePath)
{
    let possibleLightning = [
        [[-1, 1],[2, 0],[-1, 1]],
        [[1, 1],[-2, 0],[1, 1]],
        [[-1, -1],[2, 0],[-1, -1]],
        [[1, -1],[-2, 0],[1, -1]]
    ];
    for(let i = 0; i < possibleLightning.length; i++)
   {
    if(equalArray(relativePath,possibleLightning[i]))
    {
       return true;
    }
   }
}

//checks path made by player and sees if it follows any infinity patterns
function detectInfinity(relativePath)
{
    let possibleInfinity = [
        [[-2, 0] , [-1, 1] , [1, 1] , [2, 0] , [1, -1] , [1, -1] , [2, 0] , [1, 1] , [-1, 1] , [-2, 0]],
        [[2, 0] , [1, -1] , [-1, -1] , [-2, 0] , [-1, 1] , [-1, 1] , [-2, 0] , [-1, -1] , [1, -1] , [2, 0]],
        [[-2, 0] , [-1, -1] , [1, -1] , [2, 0] , [1, 1] , [1, 1] , [2, 0] , [1, -1] , [-1, -1] , [-2, 0]],
        [[2, 0] , [1, 1] , [-1, 1] , [-2, 0] , [-1, -1] , [-1, -1] , [-2, 0] , [-1, 1] , [1, 1] , [2, 0]]
    ];
    for(let i = 0; i < possibleInfinity.length; i++)
   {
    if(equalArray(relativePath,possibleInfinity[i]))
    {
        return true;
    }
   }
}

//checks path made by player and sees if it follows any W patterns
function detectW(relativePath)
{
    let possibleW = [
        [[1, 1],[1, -1],[1, 1],[1, -1]],
        [[-1, 1],[-1, -1],[-1, 1],[-1, -1]]
    ];
    for(let i = 0; i < possibleW.length; i++)
   {
    if(equalArray(relativePath,possibleW[i]))
    {
        return true;
    }
   }
}

//checks path made by player and sees if it follows any trapezoid patterns
function detectTrapezoid(relativePath)
{
    let possibleTrapezoid = [
        [[-1, 1] , [2, 0] , [2, 0] , [-1, -1]],
        [[2, 0] , [2, 0] , [-1, -1] , [-2, 0]],
        [[2, 0] , [-1, -1] , [-2, 0] , [-1, 1]],
        [[-1, -1] , [-2, 0] , [-1, 1] , [2, 0]],
        [[-2, 0] , [-1, 1] , [2, 0] , [2, 0]],
        [[2, 0] , [1, 1] , [-2, 0] , [-2, 0]],
        [[1, 1] , [-2, 0] , [-2, 0] , [1, -1]],
        [[-2, 0] , [1, -1] , [2, 0] , [1, 1]],
        [[1, -1] , [2, 0] , [1, 1] , [-2, 0]],
        [[-1, -1] , [2, 0] , [2, 0] , [-1, 1]],
        [[2, 0] , [2, 0] , [-1, 1] , [-2, 0]],
        [[2, 0] , [-1, 1] , [-2, 0] , [-1, -1]],
        [[-1, 1] , [-2, 0] , [-1, -1] , [2, 0]],
        [[-2, 0] , [-1, -1] , [2, 0] , [2, 0]],
        [[2, 0] , [1, -1] , [-2, 0] , [-2, 0]],
        [[1, -1] , [-2, 0] , [-2, 0] , [1, 1]],
        [[-2, 0] , [-2, 0] , [1, 1] , [2, 0]],
        [[-2, 0] , [1, 1] , [2, 0] , [1, -1]],
        [[1, 1] , [2, 0] , [1, -1] , [-2, 0]]
    ];
    for(let i = 0; i < possibleTrapezoid.length; i++)
   {
    if(equalArray(relativePath,possibleTrapezoid[i]))
    {
        return true;
    }
   }
}

//funciton that cheks to see if two 2D array's are equal to each other
function equalArray(array1, array2) {
    if (!Array.isArray(array1) && !Array.isArray(array2)) {
        return array1 === array2;
    }

    if (array1.length !== array2.length) {
        return false;
    }

    for (var i = 0, len = array1.length; i < len; i++) {
        if (!equalArray(array1[i], array2[i])) {
            return false;
        }
    }
    return true;
}
