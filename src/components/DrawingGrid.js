import React, {useEffect} from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`

const InputWrapper = styled.div`
    display: flex;
    margin-top: 20px;
`

const DrawingGrid = ({input}) => {

    function onClickCalculate (){
        let coordinates = []
        let scaledCoordinates = []
        console.log(input)

        const ref = input[1]
        const a = ref["endX"] - ref["startX"]
        const b = ref["endY"] - ref["startY"]
        const refLength = Math.sqrt((a*a) + (b*b))

        console.log("LÄNGE: ", refLength)
        const scale = input[0] / refLength
        

        existingLines.forEach((item, key) => {
            coordinates.push(item["startX"], item["startY"])
            scaledCoordinates.push(item["startX"] * scale, item["startY"] * scale)
        })

        Math.area = Math.area || function(polygon){
            const length = polygon.length;

            let sum = 0;

            for(let i = 0; i < length; i += 2){
                sum += polygon[i    ] * polygon[(i + 3) % length]
                    - polygon[i + 1] * polygon[(i + 2) % length];
            }

            return Math.abs(sum) * 0.5;
        }

        let area_px = Math.area(coordinates)
        let area_m = Math.area(scaledCoordinates)
        console.log(coordinates, scaledCoordinates)
        console.log("DIE FLÄCHE IN PX BETRÄGT: ", area_px)
        console.log("DIE FLÄCHE IN M BETRÄGT: ", area_m)

        isActive = false;
        currentLine = 0;
    }

    var canvas = null;
    var bounds = null;
    var ctx = null;
    var hasLoaded = false;
    
    var startX = 0;
    var startY = 0;
    var mouseX = 0;
    var mouseY = 0;
    var isDrawing = false;
    var existingLines = [];
    let currentLine = {};
    let lineAdded = false;
    let isActive = true;

    let img = document.getElementById("image");
    
    function draw() {
        
        let canvas = document.getElementById("canvas");
        let canvasHeight = canvas.height;
        let canvasWidth = canvas.width;
        ctx.fillStyle = "white";
        ctx.fillRect(0,0,canvasWidth,canvasHeight);

        //console.log("IN DRAWING: ", canvas)
        
        ctx.strokeStyle = "green";
        ctx.lineWidth = 2;

        //console.log("IN DRAW: ", img)
        ctx.drawImage(img, 0, 0);

        ctx.beginPath();

        /*for(let i = 0; i <= 10; i++){
            ctx.moveTo(0,(canvasHeight/10) * i);
            ctx.lineTo(canvasWidth,(canvasHeight/10) * i)
            ctx.stroke();

            ctx.moveTo((canvasWidth/10) * i,0);
            ctx.lineTo((canvasWidth/10) * i,canvasHeight)
            ctx.stroke();
        }

        ctx.beginPath();

        ctx.moveTo(0, canvasHeight/2);
        ctx.lineTo(canvasWidth, canvasHeight/2)
        ctx.strokeStyle = "black";
        ctx.lineWidth = 4;

        ctx.moveTo(canvasWidth/2, 0);
        ctx.lineTo(canvasWidth/2, canvasHeight)
        ctx.stroke();*/

        hasLoaded = true;
        
        for (var i = 0; i < existingLines.length; ++i) {
            var line = existingLines[i];
            ctx.moveTo(line.startX,line.startY);
            ctx.lineTo(line.endX,line.endY);
        }
    
        ctx.stroke();
        
        if (isDrawing) {
            ctx.strokeStyle = "darkred";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(startX,startY);
            ctx.lineTo(mouseX,mouseY);
            ctx.stroke();
        }

    }
    
    function onmousedown(e) {
        if (hasLoaded && e.button === 0) {
            if (!isDrawing && isActive) {
                startX = e.clientX - bounds.left;
                startY = e.clientY - bounds.top;
                
                isDrawing = true;
            }
            else {
                existingLines.push(currentLine)
                lineAdded = true;
                isDrawing = false;
            }
            
            draw();

        }
    }
    
    function onmouseup(e) {
        if (hasLoaded && e.button === 0) {
            if (lineAdded && isActive) {
                startX = currentLine["endX"];
                startY = currentLine["endY"];
                
                isDrawing = true;
                lineAdded = false;
            }
            
            isActive && draw();
        }
    }
    
    function onmousemove(e) {
        if (hasLoaded) {
            mouseX = e.clientX - bounds.left;
            mouseY = e.clientY - bounds.top;
            
            if (isDrawing && isActive) {
                currentLine = {
                    startX: startX,
                    startY: startY,
                    endX: mouseX,
                    endY: mouseY
                };
                draw();
            }
        }
    }

    const onLoadFunc = () => {
        console.log("LOADING CANVAS")
        canvas = document.getElementById("canvas");
        canvas.width = 1280;
        canvas.height = 622;
        canvas.onmousedown = onmousedown;
        canvas.onmouseup = onmouseup;
        canvas.onmousemove = onmousemove;
        
        bounds = canvas.getBoundingClientRect();
        ctx = canvas.getContext("2d");
        
        draw();
    }

    useEffect(() => {
        console.log("LOADING CANVAS")
        canvas = document.getElementById("canvas");
        canvas.width = 1280;
        canvas.height = 622;
        canvas.onmousedown = onmousedown;
        canvas.onmouseup = onmouseup;
        canvas.onmousemove = onmousemove;
        
        bounds = canvas.getBoundingClientRect();
        ctx = canvas.getContext("2d");
        
        draw();
    }, [])

    const [gridRendered, setGridRendered] = React.useState(false)

    //console.log("GRID RENDERED: ", gridRendered)

    /*React.useEffect (() => {
        setGridRendered(true)
    }, [])*/

    return (
        <Wrapper>
            <h5>Drawing Grid</h5>          
            <canvas id="canvas"></canvas>
            <InputWrapper>
                <button onClick={() => onClickCalculate()}>Fläche berechnen --></button>   
            </InputWrapper> 
            <img hidden={true} id="image" src="/assets/rect-test-area.jpg"></img>
        </Wrapper>
    )
}

export default DrawingGrid
