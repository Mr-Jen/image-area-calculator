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

const DrawingGrid = ({inputData}) => {

    function onClickCalculateArea (){
        let coordinates = [];
        let scaledCoordinates = [];

        const ref = inputData["inputRef"]
        const length = inputData["inputLength"]
        const a = ref["endX"] - ref["startX"]
        const b = ref["endY"] - ref["startY"]
        const refLength = Math.sqrt((a*a) + (b*b))

        console.log("LÄNGE: ", refLength)
        const scale = length / refLength
        
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
        setRes(area_m);
        console.log("DIE FLÄCHE IN PX BETRÄGT: ", area_px)
        console.log("DIE FLÄCHE IN M BETRÄGT: ", area_m)

        isActive = false;
    }
    
    const calcCoordDiff = (nPoint, point) => {
        if (nPoint[0] >= point[0] && nPoint[1] >= point[1]){
            return ((nPoint[0] >= mouseX && point[0] <= mouseX) && (nPoint[1] >= mouseY && point[1] <= mouseY)) && true;
        } else if (nPoint[0] >= point[0] && nPoint[1] <= point[1]){
            return ((nPoint[0] >= mouseX && point[0] <= mouseX) && (nPoint[1] <= mouseY && point[1] >= mouseY)) && true;
        } else if (nPoint[0] <= point[0] && nPoint[1] >= point[1]){
            return ((nPoint[0] <= mouseX && point[0] >= mouseX) && (nPoint[1] >= mouseY && point[1] <= mouseY)) && true;  
        } else if (nPoint[0] <= point[0] && nPoint[1] <= point[1]){
            return ((nPoint[0] <= mouseX && point[0] >= mouseX) && (nPoint[1] <= mouseY && point[1] >= mouseY)) && true;      
        }
    }

    const calcLineIntersect = () => {
        let lineIntersect = false;
        let ePoints = existingPoints?.current;
        let yIntercept = 0;
        let calculatedY = 0;
        intersectedPoints.current = [];

        ePoints.forEach((point, index) => {
            let nPoint = ePoints[index+1] ? ePoints[index+1] : null;
            let slope = nPoint && ((nPoint[1]-point[1]) / (nPoint[0]-point[0]));
            yIntercept = nPoint && (point[1] - slope * point[0]);
            calculatedY = mouseX * slope + yIntercept

            let isNotOnPointX = nPoint && ((Math.abs(mouseX - point[0]) > nodeButtonRadius) && (Math.abs(mouseX - nPoint[0]) > nodeButtonRadius));
            let isNotOnPointY = nPoint && ((Math.abs(mouseY - point[1]) > nodeButtonRadius) && (Math.abs(mouseY - nPoint[1]) > nodeButtonRadius));

            if(nPoint !== null && calcCoordDiff(nPoint, point) && (isNotOnPointX && isNotOnPointY) ){
                if (Math.abs(calculatedY - mouseY) <= 20) {
                    lineIntersect = true;
                    intersectedPoints.current = [point, nPoint];
                    window.requestAnimationFrame(draw);
                }
            }
        })
        requestAnimationFrame(draw);
        return lineIntersect;
    }

    const addPointOnLine = () => {
        let indexOfFirstPoint = existingPoints.current.indexOf(intersectedPoints.current[0]);
        existingPoints.current.splice(indexOfFirstPoint+1, 0, [mouseX, mouseY]);
        pointCreated = true;
        console.log(existingPoints.current)
        window.requestAnimationFrame(draw);
    }

    let canvas = null;
    let hasLoaded = false;
    
    let mouseX = 0;
    let mouseY = 0;
    let isDrawing = false;
    let isDragging = false;
    let draggingPointIndex = null;
    let pointCreated = false;
    let isActive = true;
    const nodeButtonRadius = 5;

    const [position, setPosition] = useState([0,0]);
    const [showContextMenu, setShowContextMenu] = useState(false);
    const [menuPosition, setMenuPosition] = useState([]);
    const [res, setRes] = useState(null);
    let img = document.getElementById("image");
    
    function draw() {
        pointCreated = false;
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
        
        existingPoints.current.forEach((point, index) => {
            let match = false;
            let nPoint = existingPoints.current[index+1] && existingPoints.current[index+1]
            if (nPoint && intersectedPoints.current){
                match = (point === intersectedPoints.current[0] && nPoint && intersectedPoints.current[1]) && true;
            }

            if (match){
                ctx.beginPath();
                ctx.moveTo(point[0], point[1])
                nPoint && ctx.lineTo(nPoint[0], nPoint[1])
                //ctx.strokeStyle = "blue";
                ctx.setLineDash([10, 10]);
                ctx.lineWidth = 4;
                ctx.stroke();
            }
            else {
                ctx.beginPath();
                ctx.moveTo(point[0], point[1])
                nPoint && ctx.lineTo(nPoint[0], nPoint[1])
                ctx.strokeStyle = "green";
                ctx.setLineDash([]);
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        })
    
        //ctx.stroke();
        
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
        window.requestAnimationFrame(draw);
    }

    const onHandleReset = () => {
        isActive = true;
        existingPoints.current = [];
        window.requestAnimationFrame(draw);
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
            window.requestAnimationFrame(draw);
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
            isActive && window.requestAnimationFrame(draw);
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

            setPosition([mouseX, mouseY]);

            calcLineIntersect();

            //intersectedPoints.length > 0 && console.log("MOUSE INTERSECTS AT : ", intersectedPoints);
            
            (isDrawing && isActive) && window.requestAnimationFrame(draw);

            if(!isActive && isDragging){
                existingPoints.current[draggingPointIndex] = (calcClosePoint().length > 0 && (draggingPointIndex === 0 || draggingPointIndex === existingPoints.current.length - 1)) ? calcClosePoint() : [mouseX, mouseY]
                window.requestAnimationFrame(draw);
            }
        }
    }

    const canvasRef = React.useRef();
    const imageRef = React.useRef();
    let existingPoints = useRef([]);
    let selectedNodeIndex = useRef(null);
    let intersectedPoints = useRef([]);

    useEffect(() => {
        let canvas = canvasRef.current;
        canvas.addEventListener('contextmenu', function(event) {
            event.preventDefault();

            intersectedPoints.current.length > 0 && addPointOnLine();

            existingPoints.current.forEach((point) => {
                if( (Math.abs(mouseX - point[0]) <= nodeButtonRadius && Math.abs(mouseY - point[1]) <= nodeButtonRadius) && !pointCreated ){
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
        
        window.requestAnimationFrame(draw);
    }, [])

    return (
        <Wrapper>
            <h5>Drawing Grid</h5>  
            <h2>X: {position[0]} Y:{position[1]}</h2>
            <h5>Interceptors {intersectedPoints.current}</h5>    
            <canvas id="canvas" ref={canvasRef}></canvas>
            <InputWrapper>
                <button onClick={() => onHandleReset()}>Zurücksetzen</button>  
                <button onClick={() => onClickCalculateArea()}>Fläche berechnen --></button>
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
            { res &&
                <div>
                    <h2>Ergebnis: {res}</h2>
                </div>
            }
        </Wrapper>
    )
}

export default DrawingGrid
