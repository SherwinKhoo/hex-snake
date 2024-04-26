"use strict"

// https://www.redblobgames.com/grids/hexagons/#basics
// https://www.redblobgames.com/grids/hexagons/#neighbors-axial
// https://www.redblobgames.com/grids/hexagons/#angles
// https://www.redblobgames.com/grids/hexagons/#hex-to-pixel
// https://www.redblobgames.com/grids/hexagons/#pixel-to-hex

// MARK: Canvas

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// vh and vw only available in CSS
// canvas height = 0.9 * 97vh
// canvas width = 98vw
const viewportWidth = window.innerWidth
const viewportHeight = window.innerHeight

const usableCanvasWidth = 0.98 * viewportWidth
const usableCanvasHeight = 0.8 * 0.97 * viewportHeight

const vw = 0.01 * viewportWidth
const vh = 0.01 * viewportHeight

canvas.width = 0.98 * viewportWidth;
canvas.height = 0.9 * 0.97 * viewportHeight;

const sqrt3 = Math.sqrt(3)
const hexRadius = Math.max(vh, vw)
const hexWidth = sqrt3 * hexRadius
const hexHeight = 2 * hexRadius

const spacingHorizontal = sqrt3 * hexRadius
const spacingVertical = 1.5 * hexRadius

// MARK: Grid

const createCoordinate = (q, r) => {
    return {q, r}
}
const coordinateToString = (coordinate) => {
    return `${coordinate.q},${coordinate.r}`
}

const calculateGridDimensions = (dimension) => {
    let gridDimension = 0
    switch (dimension % 2) {
        case 0:
            gridDimension = 0.5 * dimension - 1
            break;
        case 1:
            gridDimension = Math.floor(0.5 * dimension)
            break;
        default:
            break;
    }
    return gridDimension // integer
}

// determine number of cells across and up based on available drawing width / height
const calculateHexesToSides = () => {
    const gridShortSide = Math.floor( Math.min(usableCanvasHeight, usableCanvasWidth) / hexHeight )
    const gridLongSide = Math.floor( Math.max(usableCanvasHeight, usableCanvasWidth) / hexHeight )

    let gridRadiusWidth = 0
    let gridRadiusHeight = 0

    if (usableCanvasHeight >= usableCanvasWidth) {
        gridRadiusWidth = calculateGridDimensions(gridShortSide)
        gridRadiusHeight = calculateGridDimensions(gridLongSide)
    } else {
        gridRadiusWidth = calculateGridDimensions(gridLongSide)
        gridRadiusHeight = calculateGridDimensions(gridShortSide)
    }

    return [gridRadiusWidth, gridRadiusHeight] // integers
}

// calculate the centre of "usable" canvas
const calculateGridCentre = () => {
    const x = 0.5 * usableCanvasWidth
    const y = 0.5 * usableCanvasHeight + (0.1 * 0.97 * viewportHeight)
    return [x, y] // pixels
}

const myGrid = new Map()

const calculateGridAxialCoordinates = () => {
    const [q, r] = calculateHexesToSides()
    for (let h = (-1) * r; h <= r; h++) {
        const wEnd = h % 2 === 0 ? q : q - 1 // because esthetics
        for (let w = (-1) * q; w <= wEnd; w++) {
        // for (let w = (-1) * q; w <= q; w++) {
            const offset = Math.floor(0.5 * h)
            const wNew = w - offset
            myGrid.set( coordinateToString( createCoordinate(wNew, h) ), [wNew, h] );
        }
    }
    // console.log(myGrid);
}
calculateGridAxialCoordinates()

// calculate the centre of any hex, given axial values
// returns pixel values
const calculateHexCentreFromGridCentre = (axialCoordinates) => {
    const [q, r] = axialCoordinates
    const [xCentre, yCentre] = calculateGridCentre()

    // return [xCentre + (q * spacingHorizontal), yCentre + (r * spacingVertical)] // wrong
    return [xCentre + hexRadius * (sqrt3 * q + 0.5 * sqrt3 * r), yCentre + hexRadius * (1.5 * r)] // pixels
}

// MARK: Snake

let mySnake = []

const calculateMySnakeAxialCoordinates = () => {
    const [q, _r] = calculateHexesToSides()
    for (let i = 0; i < 3; i++) {
        mySnake.push([(-1) * q + (2 - i), 0])
    }
    // console.log([...mySnake]);
}
calculateMySnakeAxialCoordinates()

let myAnaconda = new Map()

const calculateMyAnacondaAxialCoordinates = () => {
    myAnaconda.clear()
    // const [q, _r] = calculateHexesToSides()
    // for (let i = 0; i < 3; i++) {
    //     myAnaconda.set( coordinateToString( createCoordinate( (-1) * q + i, 0 ) ), [(-1) * q + i, 0] )
    // }
    for (let i = 0; i < mySnake.length; i++) {
        const [q, r] = mySnake[i]
        myAnaconda.set( coordinateToString( createCoordinate(q, r) ), [q, r] )
    };
    // console.log(myAnaconda);
}
calculateMyAnacondaAxialCoordinates()

// MARK: Food
// unicode f805

const randomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

const calculateRandomAxialCoordinate = (q, r) => {
    const qRandom = randomNumber((-1) * q, q)
    const rRandom = randomNumber((-1) * r, r)
    return [qRandom, rRandom]
}

const myFood = new Map()

const calculateMyFoodHex = () => {
    myFood.clear()
    const [q, r] = calculateHexesToSides()
    let qHex
    let rHex
    let stringCoordinates
    do {
        [qHex, rHex] = calculateRandomAxialCoordinate(q, r)
        stringCoordinates = coordinateToString( createCoordinate( qHex, rHex ) )
    } while (!myGrid.has(stringCoordinates) || myAnaconda.has(stringCoordinates));

    myFood.set( coordinateToString( createCoordinate( qHex, rHex ) ), [qHex, rHex] )
    // console.log(myFood);
}
calculateMyFoodHex()

// MARK: Render

const renderHex = (centreOfHex, hexRadius, isSolid = false, pixelColour = "--pixel-colour") => {
    const [x, y] = centreOfHex

    const rootStyles = getComputedStyle(document.documentElement)
    ctx.strokeStyle = rootStyles.getPropertyValue(pixelColour)
    ctx.fillStyle = rootStyles.getPropertyValue(pixelColour)

    ctx.lineWidth = 0.5
    ctx.beginPath()

    for (let i = 0; i < 6; i++) {
        const angleDegree = 60 * i - 30
        const angleRadian = (Math.PI / 180) * angleDegree
        const xPosition = x + hexRadius * Math.cos(angleRadian)
        const yPosition = y + hexRadius * Math.sin(angleRadian)
        
        if (i === 0) {
            ctx.moveTo(xPosition, yPosition)
        }
        if (i > 0) {
            ctx.lineTo(xPosition, yPosition)
        }
    }

    ctx.closePath()
    
    if (isSolid) {
        ctx.fill()
    }

    ctx.stroke()
}

const renderGameObject = (gameObject, isSolid = false, pixelColour = "--pixel-colour") => {
    for (const value of gameObject.values()) {
        if (gameObject === myAnaconda) {
            isSolid = true
        }
        if (gameObject === myFood) {
            const bunImage = new Image()
            bunImage.src = "./burger-solid.svg"

            const [x, y] = calculateHexCentreFromGridCentre(value)
            ctx.drawImage(bunImage, x - 0.5 * hexRadius, y - 0.5 * hexRadius, hexRadius, hexRadius)

            bunImage.onerror = (error) => {
                console.error("Error loading image:", error);
            };
        }
        if (gameObject !== myFood) {
            renderHex(calculateHexCentreFromGridCentre(value), hexRadius, isSolid, pixelColour)
        }
    }
}

renderGameObject(myFood)
renderGameObject(myAnaconda)
renderGameObject(myGrid)

// MARK: Directions

const directionsArray = [
    [0, -1, "up + left"],
    [1, -1, "up + right"],
    [1, 0, "right"],
    [0, 1, "down + right"],
    [-1, 1, "down + left"],
    [-1, 0, "left"]
]
let indexDirection = 2
const calculateModulatedIndexDirected = (index) => {
    return index % 6
}

// buttons

const buttonLeft = document.getElementById("button-left")
const buttonCentre = document.getElementById("button-centre")
const buttonRight = document.getElementById("button-right")

let checkUpdate

let score = 0
let highscore = 0

const handleStartReset = () => {
    
    clearInterval(checkUpdate)
    updateDisplayHighscore()
    score = 0
    indexDirection = 2
    calculateMyFoodHex()

    if (myAnaconda.size > 0) {
        mySnake = []
        calculateMySnakeAxialCoordinates()
    }

    checkUpdate = setInterval(
        () => {
            growMyAnaconda()
            updateGame()
        }
    , 250);

    const buttonCentre = document.getElementById("button-centre")
    buttonCentre.innerHTML = ``
    
    const iconRestart = document.createElement("i")
    iconRestart.className = "fa-solid fa-arrows-rotate"
    
    buttonCentre.append(iconRestart)  
}

const handleLeftTurn = () => {
    indexDirection = calculateModulatedIndexDirected(indexDirection - 1 + 6)
    console.log("Left", directionsArray[indexDirection]);
}
const handleRightTurn = () => {
    indexDirection = calculateModulatedIndexDirected(indexDirection + 1 + 6)
    console.log("Right", directionsArray[indexDirection]);
}

buttonCentre.addEventListener("click", handleStartReset)
buttonLeft.addEventListener("click", handleLeftTurn)
buttonRight.addEventListener("click", handleRightTurn)

// keyboard

const noReverseDirection = (index) => {
    if (calculateModulatedIndexDirected(index + 3) !== indexDirection) {
        indexDirection = index
    }
}

const handleKeypress = (event) => {
    switch (event.key) {
        case " ":
            handleStartReset()
            break;
        case "ArrowLeft":
            handleLeftTurn()
            break;
        case "ArrowRight":
            handleRightTurn()
            break;
        case "W":
        case "w":
            noReverseDirection(0)
            break;
        case "E":
        case "e":
            noReverseDirection(1)
            break;
        case "D":
        case "d":
            noReverseDirection(2)
            break;
        case "X":
        case "x":
            noReverseDirection(3)
            break;
        case "Z":
        case "z":
            noReverseDirection(4)
            break;
        case "A":
        case "a":
            noReverseDirection(5)
            break;
        default:
            break;
    }
    console.log(event.key, directionsArray[indexDirection]);
}

document.addEventListener("keyup", handleKeypress)

// MARK: Collision

const checkCollisionWall = () => {
    const [q, r, ..._rest] = mySnake[0] // head
    const stringCoordinates = coordinateToString( createCoordinate(q, r) )
    if (!myGrid.has(stringCoordinates)) {
        endGame()
        console.log("bing-bing bong bong bing-bing-bing");
    }
}

const checkCollisionSelf = () => {
    for (let i = 1; i < mySnake.length; i++) {
        if (mySnake[0][0] === mySnake[i][0] && mySnake[0][1] === mySnake[i][1]) {
            endGame()
            console.log("ooof");
        }
    }
}

let isFood = false
const checkCollisionFood = () => {
    const [q, r, ..._rest] = mySnake[0]
    const stringCoordinates = coordinateToString( createCoordinate(q, r) )
    // console.log(stringCoordinates, myFood);
    if (myFood.has(stringCoordinates)) {
        isFood = true
        console.log("nom nom nom");
    }
}

const checkCollision = setInterval(() => {
    checkCollisionSelf()
    checkCollisionWall()
    checkCollisionFood()
}, 1)

// MARK: Update

const updateGame = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    renderGameObject(myFood)
    calculateMyAnacondaAxialCoordinates()
    renderGameObject(myAnaconda)
    renderGameObject(myGrid)
}

const displayScore = document.getElementById("score")
const displayHighscore = document.getElementById("highscore")

displayScore.innerHTML = `&nbsp&nbspScore: ${score}`
displayHighscore.innerHTML = `Highscore: ${highscore}&nbsp&nbsp`

const saveScoreToLocalStorage = (score) => {
    localStorage.setItem("highscore", score)
}

const updateDisplayHighscore = () => {
    highscore = parseInt(localStorage.getItem("highscore"))
    if (isNaN(highscore)) {
        highscore = 0
    }
    displayHighscore.innerHTML = `Highscore: ${highscore}&nbsp&nbsp`
}

const growMyAnaconda = () => {
    const [qDirection, rDirection, ..._rest] = directionsArray[indexDirection]
    const [qAnaconda, rAnaconda] = mySnake[0]
    const newHead = [ qAnaconda + qDirection, rAnaconda + rDirection ]
    // console.log([...mySnake]);

    if (isFood) {
        mySnake.push(mySnake[mySnake.length - 1])
        for (let i = mySnake.length - 2; i >= 1; i--) {
            mySnake[i] = mySnake[i - 1]
        }
        mySnake[0] = newHead
        isFood = false
        calculateMyFoodHex()
        
        score++
        displayScore.innerHTML = `&nbsp&nbspScore: ${score}`
        if (score > highscore) {
            saveScoreToLocalStorage(score)
            updateDisplayHighscore()
        }

        console.log(score, highscore);

    } else {
        for (let i = mySnake.length - 1; i >= 1; i--) {
            mySnake[i] = mySnake[i - 1]
        }
        mySnake[0] = newHead
    }
    // console.log([...mySnake]);
}

const endGame = () => {
    clearInterval(checkUpdate)
    clearInterval(checkCollision)
}