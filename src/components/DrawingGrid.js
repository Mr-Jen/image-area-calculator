import React, {useEffect, useState, useRef} from 'react'
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
        
        existingPoints.current.forEach((point) => {
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
    let hasLoaded = false;
    
    let mouseX = 0;
    let mouseY = 0;
    let isDrawing = false;
    let isDragging = false;
    let draggingPointIndex = null;
    let isActive = true;
    const nodeButtonRadius = 5;

    //const [position, setPosition] = useState([0,0]);
    const [showContextMenu, setShowContextMenu] = useState(false);
    const [menuPosition, setMenuPosition] = useState([]);

    let img = document.getElementById("image");
    
    function draw() {
        let ctx = canvasRef.current.getContext("2d");
        canvas = canvasRef
        let canvasHeight = canvas.height;
        let canvasWidth = canvas.width;
        ctx.fillStyle = "white";
        ctx.fillRect(0,0,canvasWidth,canvasHeight);

        ctx.drawImage(img, 0, 0);

        ctx.beginPath();

        existingPoints.current.forEach((point) => {
            ctx.beginPath();
            ctx.arc(point[0], point[1], nodeButtonRadius, 0, 2 * Math.PI);
            ctx.fillStyle = "green"
            ctx.lineWidth = 1;
            ctx.strokeStyle = "black"
            ctx.fill();
            ctx.stroke();
        })

        hasLoaded = true;

        ctx.beginPath();
        ctx.strokeStyle = "green";
        ctx.lineWidth = 2;
        
        existingPoints.current.forEach((point, index) => {
            let nextPoint = existingPoints.current[index+1] && existingPoints.current[index+1]
            ctx.moveTo(point[0], point[1])
            nextPoint && ctx.lineTo(nextPoint[0], nextPoint[1])
        })
    
        ctx.stroke();
        
        if (isDrawing && existingPoints.current.length > 0) {
            let lastPoint = existingPoints.current[existingPoints.current.length-1]
            ctx.strokeStyle = "darkred";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(lastPoint[0],lastPoint[1]);
            ctx.lineTo(mouseX,mouseY);
            ctx.stroke();
        }

    }
    
    const handleDeleteNode = () => {
        setShowContextMenu(false);
        selectedNodeIndex.current > -1 && existingPoints.current.splice(selectedNodeIndex.current, 1);
        selectedNodeIndex.current = null;
        draw();
    }

    const onHandleReset = () => {
        isActive = true;
        existingPoints.current = [];
        draw();
    }

    const calcClosePoint = () => {
        let closePoint = [];
        existingPoints.current.forEach((point) => {
            if( Math.abs(mouseX - point[0]) <= 2 * nodeButtonRadius && Math.abs(mouseY - point[1]) <= 2 * nodeButtonRadius ){
                closePoint = point
            }
        })
        return closePoint
    }

    function onmousedown(e) {
        if (hasLoaded && e.button === 0) {
            isDrawing = false;
            if (!isDrawing && isActive) {
                let closePoint = calcClosePoint();

                if (closePoint.length > 0){
                    existingPoints.current.push(closePoint)
                    isActive = false;
                }
                else {
                    existingPoints.current.push([mouseX, mouseY])
                }
            }
            draw();
        }

        !isActive && existingPoints.current.forEach((point, index) => {
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
            mouseX = e.clientX - canvasRef.current.getBoundingClientRect().left;
            mouseY = e.clientY - canvasRef.current.getBoundingClientRect().top;
            
            (isDrawing && isActive) && draw();

            if(!isActive && isDragging){
                existingPoints.current[draggingPointIndex] = (calcClosePoint().length > 0 && (draggingPointIndex === 0 || draggingPointIndex === existingPoints.current.length - 1)) ? calcClosePoint() : [mouseX, mouseY]
                draw();
            }
        }
    }

    const canvasRef = React.useRef();
    const imageRef = React.useRef();
    let existingPoints = useRef([]);
    let selectedNodeIndex = useRef(null);

    useEffect(() => {
        let canvas = canvasRef.current;
        canvas.addEventListener('contextmenu', function(event) {
            event.preventDefault();

            existingPoints.current.forEach((point) => {
                if( Math.abs(mouseX - point[0]) <= nodeButtonRadius && Math.abs(mouseY - point[1]) <= nodeButtonRadius ){
                    selectedNodeIndex.current = existingPoints.current.indexOf(point)
                    console.log("SHOW CONTEXT MENU OF NODE: ", selectedNodeIndex.current)
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
        
        draw();
    }, [])

    return (
        <Wrapper>
            <h5>Drawing Grid</h5>      
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
                    onDeleteNode={handleDeleteNode}
                    onCloseMenu={() => setShowContextMenu(false)}
                />
            }
        </Wrapper>
    )
}

export default DrawingGrid
