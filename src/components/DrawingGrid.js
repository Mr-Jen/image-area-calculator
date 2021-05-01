import React, {useEffect, useState, useRef} from 'react'
import styled from 'styled-components'

import ContextMenu from './ContextMenu'

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`

const CanvasWrapper = styled.div`
    width: 1200px;
    height: 600px;
    position: relative;
    margin: 10px;
`

const Canvas = styled.canvas`
    position: absolute;
    top: 0;
    left: 0;
    border: 1px solid black;
    border-radius: 10px;
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

        isActiveRef.current = false;
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

            //nPoint && console.log("CROSSING LINE: ", calcCoordDiff(nPoint, point) ? true : false);

            if(nPoint !== null && calcCoordDiff(nPoint, point) && (isNotOnPointX && isNotOnPointY) ){
                //console.log("CROSSING LINE: ", calcCoordDiff(nPoint, point) ? true : false);

                /*console.group();
                console.log("SLOPE: ", slope);
                console.log("Calculated Y: ", calculatedY, "MouseY: ", mouseY);
                console.log("Y DIFFERENCE: ", Math.abs(calculatedY - mouseY), "BETWEEN POINTS: ", index, index+1);
                console.groupEnd();*/

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

    let drawingCanvas = null;
    let hasLoaded = false;
    let bounds = null;
    let ctx = null;
    
    let mouseX = 0;
    let mouseY = 0;
    let isDrawing = false;
    let isDragging = false;
    //let draggingPointIndex = null;
    let pointCreated = false;
    const nodeButtonRadius = 5;

    const [position, setPosition] = useState([0,0]);
    const [showContextMenu, setShowContextMenu] = useState(false);
    const [menuPosition, setMenuPosition] = useState([]);
    const [res, setRes] = useState(null);
    const isActiveRef = useRef(true);
    const draggingPointIndexRef = useRef();
    
    function draw() {
        pointCreated = false;
        drawingCanvas = drawingCanvasRef.current;
        ctx = drawingCanvas.getContext("2d");
        let canvasHeight = 600;
        let canvasWidth = 1200;


        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

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
                ctx.strokeStyle = "green";
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
        console.log("RESETTING")
        isActiveRef.current = true;
        existingPoints.current = [];
        window.requestAnimationFrame(draw);
    }

    const calcClosePoint = () => {
        let closePoint = [];
        existingPoints.current.forEach((point) => {
            if( Math.abs(mouseX - point[0]) <= 2 * nodeButtonRadius && Math.abs(mouseY - point[1]) <= 2 * nodeButtonRadius ){
                closePoint = point;
            }
        })
        return closePoint
    }

    function onmousedown(e) {
        if (hasLoaded && e.button === 0) {
            isDrawing = false;
            if (!isDrawing && isActiveRef.current) {
                let closePoint = calcClosePoint();

                if (closePoint.length > 0){
                    existingPoints.current.push(closePoint)
                    isActiveRef.current = false;
                }
                else {                    
                    existingPoints.current.push([mouseX, mouseY])
                }
            }
            window.requestAnimationFrame(draw);
        }

        let closeP = calcClosePoint();
        if (closeP.length > 0){
            //console.log("NOW DRAGGING IN MOUSEDOWN")
            isDragging = true;
            draggingPointIndexRef.current = existingPoints.current.indexOf(closeP);
        }
    }
    
    function onmouseup(e) {
        if (hasLoaded && e.button === 0) {
            if (isActiveRef.current) {
                isDrawing = true;
                window.requestAnimationFrame(draw);
            }
            if(!isActiveRef.current && isDragging){
                isDragging = false;
                draggingPointIndexRef.current = null;
            }
        }
    }
    
    function onmousemove(e) {
        if (hasLoaded) {
            mouseX = e.clientX - bounds.left;
            mouseY = e.clientY - bounds.top;

            setPosition([mouseX, mouseY]);

            calcLineIntersect();

            let closePoint = calcClosePoint();

            if(isActiveRef.current){
                drawingCanvasRef.current.style.cursor = "copy";
            }
            else {
                drawingCanvasRef.current.style.cursor = closePoint.length > 0 ? "grab" : "default";
            }


            (isDrawing && isActiveRef.current) && window.requestAnimationFrame(draw);

            if(!isActiveRef.current && isDragging){
                if(closePoint.length > 0 && (draggingPointIndexRef.current === 0 || draggingPointIndexRef.current === existingPoints.current.length - 1)){
                    existingPoints.current[draggingPointIndexRef.current] = closePoint;
                    window.requestAnimationFrame(draw);
                }
                else {
                    existingPoints.current[draggingPointIndexRef.current] = [mouseX, mouseY];
                    window.requestAnimationFrame(draw);
                }
            }
        }
    }

    function onwindowmove(e){
        mouseX = e.clientX;
        mouseY = e.clientY;
        console.log("ON MOUSE MOVE: ", [mouseX, mouseY])
        absMouse.current = [mouseX, mouseY]
    }

    const drawingCanvasRef = React.useRef();
    const bgCanvasRef = React.useRef();
    let existingPoints = useRef([]);
    let selectedNodeIndex = useRef(null);
    let intersectedPoints = useRef([]);
    let absMouse = useRef([]);

    const drawBg = () => {
        let cs = bgCanvasRef.current;
        cs.width = 1200;
        cs.height = 600;
        console.log("DRAWING BG")
        let bgImage = new Image();        
        bgImage.src = URL.createObjectURL(inputData["image"]);
        //bgImage.src = "http://i.imgur.com/yf6d9SX.jpg";
        bgImage.onload = function (){            
            cs.getContext("2d").drawImage(bgImage, 0, 0)
        }
        bgImage.onerror = failed;
    }

    function failed() {
        console.error("The provided file couldn't be loaded as an Image media");
    }

    useEffect(() => {
        //drawBg();

        let bgCanvas = bgCanvasRef.current;
        let bgCtx = bgCanvas.getContext("2d");

        bgCanvas.width = 1200;
        bgCanvas.height = 600;
        console.log("DRAWING BG")

        let bgImage = new Image();        
        bgImage.src = URL.createObjectURL(inputData["image"]);

        bgCtx.save();

        bgCtx.translate( 1200/2, 600/2 );
        bgCtx.rotate( inputData["imgAngle"] * Math.PI / 180 );
        bgCtx.translate( -(1200/2), -(600/2) );

        //console.log("CTX BEFORE DRAWING IMAGE: ", bgCtx)
        console.log("WINKEL: ", inputData["imgAngle"])

        bgImage.onload = function (){            
            bgCtx.drawImage(bgImage, inputData["imgPos"][0], inputData["imgPos"][1]);
        }
        
        //bgCtx.restore();
        bgImage.onerror = failed;

        //window.onmousemove = onwindowmove;

        let drawingCanvas = drawingCanvasRef.current;
        drawingCanvas.addEventListener('contextmenu', function(event) {
            event.preventDefault();

            isDragging = true;
            draggingPointIndexRef.current = null;

            intersectedPoints.current.length > 0 && addPointOnLine();

            let cPoint = calcClosePoint();
            if(cPoint.length > 0){
                selectedNodeIndex.current = existingPoints.current.indexOf(cPoint)
                console.log("SHOW CONTEXT MENU OF NODE: ", selectedNodeIndex.current)
                setShowContextMenu(true);
                setMenuPosition(cPoint);
            }
        });

        drawingCanvas.width = 1200;
        drawingCanvas.height = 600;
        bounds = drawingCanvas.getBoundingClientRect();
        ctx = drawingCanvas.getContext("2d");

        drawingCanvas.onmousedown = onmousedown;
        drawingCanvas.onmouseup = onmouseup;
        drawingCanvas.onmousemove = onmousemove;
        
        window.requestAnimationFrame(draw);
    }, [])

    return (
        <Wrapper>
            <h5>Drawing Grid</h5>  
            <h2>X: {position[0]} Y:{position[1]}</h2>
            <h5>Interceptors {intersectedPoints.current}</h5>   
            <CanvasWrapper>
                <Canvas ref={bgCanvasRef} id="bgCanvas"></Canvas>
                <Canvas ref={drawingCanvasRef} id="drawingCanvas"></Canvas>
            </CanvasWrapper>
            <InputWrapper>
                <button onClick={() => onHandleReset()}>Zurücksetzen</button>  
                <button onClick={() => onClickCalculateArea()}>Fläche berechnen --></button>
            </InputWrapper> 
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
