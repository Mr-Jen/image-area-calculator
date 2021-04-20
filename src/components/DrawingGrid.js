import React, {useEffect, useState} from 'react'
import styled from 'styled-components'

import ContextMenu from './ContextMenu'

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
        let coordinates = [];
        let scaledCoordinates = [];

        const ref = input[1]
        const a = ref["endX"] - ref["startX"]
        const b = ref["endY"] - ref["startY"]
        const refLength = Math.sqrt((a*a) + (b*b))

        console.log("LÄNGE: ", refLength)
        const scale = input[0] / refLength
        
        existingPoints.forEach((point) => {
            coordinates.push(point[0], point[1])
            scaledCoordinates.push(point[0] * scale, point[1] * scale)
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
        console.log("DIE FLÄCHE IN PX BETRÄGT: ", area_px)
        console.log("DIE FLÄCHE IN M BETRÄGT: ", area_m)

        isActive = false;
    }

    let canvas = null;
    let bounds = null;
    let ctx = null;
    let hasLoaded = false;
    
    let mouseX = 0;
    let mouseY = 0;
    let isDrawing = false;
    let isDragging = false;
    let draggingPointIndex = null;
    let selectedNodeIndex = null;
    //let existingPoints = [];
    let isActive = true;
    const nodeButtonRadius = 4;

    const [existingPoints, setExistingPoints] = useState([]);

    const [position, setPosition] = useState([0,0]);
    const [showContextMenu, setShowContextMenu] = useState(false);
    const [menuPosition, setMenuPosition] = useState([]);

    let img = document.getElementById("image");
    
    function draw() {
        canvas = canvasRef
        let canvasHeight = canvas.height;
        let canvasWidth = canvas.width;
        ctx.fillStyle = "white";
        ctx.fillRect(0,0,canvasWidth,canvasHeight);

        ctx.drawImage(img, 0, 0);

        ctx.beginPath();

        existingPoints.forEach((point) => {
            ctx.beginPath();
            ctx.arc(point[0], point[1], nodeButtonRadius, 0, 2 * Math.PI);
            ctx.fillStyle = "green"
            ctx.lineWidth = 1;
            ctx.strokeStyle = "black"
            ctx.fill();
            ctx.stroke();
            /*ctx.beginPath();
            ctx.fillRect(point[0],point[1],1,1); // fill in the pixel at (10,10)
            ctx.fill();*/
        })

        hasLoaded = true;

        ctx.beginPath();
        ctx.strokeStyle = "green";
        ctx.lineWidth = 2;

        console.log("POINTS BEFORE DRAWING: ", existingPoints)
        
        existingPoints.forEach((point, index) => {
            let nextPoint = existingPoints[index+1] && existingPoints[index+1]
            ctx.moveTo(point[0], point[1])
            nextPoint && ctx.lineTo(nextPoint[0], nextPoint[1])
        })
    
        ctx.stroke();
        
        if (isDrawing && existingPoints.length > 0) {
            let lastPoint = existingPoints[existingPoints.length-1]
            ctx.strokeStyle = "darkred";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(lastPoint[0],lastPoint[1]);
            ctx.lineTo(mouseX,mouseY);
            ctx.stroke();
        }

    }

    const logExistingPoints = () => {
        console.log("LOGGING EXISTING POINTS: ", existingPoints)
    }
    
    const handleDeleteNode = () => {
        console.log("DELETING NODE: ", existingPoints)
        logExistingPoints();

        /*let copy = existingPoints
        selectedNodeIndex > -1 && existingPoints.splice(selectedNodeIndex, 1);
        console.log("EXISTING POINTS BEFORE AND AFTER DELETION: ", copy, existingPoints)
        draw();*/
    }

    const onHandleReset = () => {
        console.log("LOGGING EXISTING POINTS: ", existingPoints)
        isActive = true;
        setExistingPoints([]);
        draw();
    }

    function onmousedown(e) {
        let pointIsClose = false;
        let closePoint = [];
        if (hasLoaded && e.button === 0) {
            isDrawing = false;
            if (!isDrawing && isActive) {
                existingPoints.forEach((point) => {
                    if( Math.abs(mouseX - point[0]) <= nodeButtonRadius && Math.abs(mouseY - point[1]) <= nodeButtonRadius ){
                        pointIsClose = true;
                        closePoint = point
                    }
                })

                
                let oldPoints = [...existingPoints];
                if (pointIsClose){
                    oldPoints.push(closePoint);
                    console.log("POINTS BEFORE SETTING CLOSE: ", oldPoints)
                    setExistingPoints(oldPoints)
                } else {
                    oldPoints.push([mouseX, mouseY])
                    console.log("POINTS BEFORE SETTING: ", oldPoints)
                    setExistingPoints(oldPoints)
                }
                
                //logExistingPoints();
                if (existingPoints.length > 1){
                    if(existingPoints[0] === existingPoints[existingPoints.length-1]){
                        isActive = false;
                    }
                }
            }
            draw();
        }

        !isActive && existingPoints.forEach((point, index) => {
            if( Math.abs(mouseX - point[0]) <= nodeButtonRadius && Math.abs(mouseY - point[1]) <= nodeButtonRadius ){
                isDragging = true;
                draggingPointIndex = index;

            }
        })
    }
    
    function onmouseup(e) {
        if (hasLoaded && e.button === 0) {
            if (isActive) {
                isDrawing = true;
            }
            isActive && draw();
        }
        if(!isActive && isDragging){
            isDragging = false;
            draggingPointIndex = null;
        }
    }
    
    function onmousemove(e) {
        if (hasLoaded) {
            mouseX = e.clientX - bounds.left;
            mouseY = e.clientY - bounds.top;
            
            if (isDrawing && isActive) {
                draw();
            }

            if(!isActive && isDragging){
                let oldPoints = [...existingPoints]
                oldPoints[draggingPointIndex] = [mouseX, mouseY]
                setExistingPoints(oldPoints)
                draw();
            }
        }
    }

    const canvasRef = React.useRef();
    const imageRef = React.useRef();

    useEffect(() => {
        let canvas = canvasRef.current;
        canvas.addEventListener('contextmenu', function(event) {
            event.preventDefault();

            existingPoints.forEach((point) => {
                if( Math.abs(mouseX - point[0]) <= nodeButtonRadius && Math.abs(mouseY - point[1]) <= nodeButtonRadius ){
                    selectedNodeIndex = existingPoints.indexOf(point)
                    console.log("SHOW CONTEXT MENU OF NODE: ", selectedNodeIndex)
                    setShowContextMenu(true);
                    setMenuPosition(point);
                }
            })

        });
        canvas.width = 1280;
        canvas.height = 622;
        canvas.onmousedown = onmousedown;
        canvas.onmouseup = onmouseup;
        canvas.onmousemove = onmousemove;
        
        bounds = canvas.getBoundingClientRect();
        ctx = canvas.getContext("2d");
        
        draw();
    }, [])

    useEffect(() => {
        console.log("POINT ADDED: ", existingPoints)
        draw();
    }, [existingPoints])

    return (
        <Wrapper>
            <h5>Drawing Grid</h5> 
            <h2>Position: {position[0]} {position[1]}</h2>         
            <canvas id="canvas" ref={canvasRef}></canvas>
            <InputWrapper>
                <button onClick={() => onHandleReset()}>Zurücksetzen</button>  
                <button onClick={() => onClickCalculate()}>Fläche berechnen --></button>
            </InputWrapper> 
            <img 
                alt="tracking-objects" 
                hidden={true} id="image" 
                src="/assets/rect-test-area.jpg"
                ref={imageRef}
            >
            </img>
            {showContextMenu && 
                <ContextMenu 
                    marginLeft={menuPosition[0]} 
                    marginTop={menuPosition[1]} 
                    onDeleteNode={() => handleDeleteNode()}
                    onCloseMenu={() => setShowContextMenu(false)}
                />
            }
        </Wrapper>
    )
}

export default DrawingGrid
