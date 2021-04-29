import React, {useState, useEffect} from 'react'
import styled from 'styled-components'

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

/*const InputWrapper = styled.div`
    display: flex;
    margin-top: 20px;
`*/
const InputWrapper = styled.div`
`

const ReferenceGrid = ({onHandleSubmit}) => {

    var bounds = null;
    var ctx = null;
    let drawingCanvas = null;
    var hasLoaded = false;
    
    var startX = 0;
    var startY = 0;
    var mouseX = 0;
    var mouseY = 0;
    var isDrawing = false;
    let inputLine = {}
    let isDragging = false;
    let dragStartPosition = [];
    
    function draw() {
        
        let drawingCanvas = drawingCanvasRef.current;
        let ctx = drawingCanvas.getContext("2d");
        let canvasHeight = 600;
        let canvasWidth = 1200;
        
        ctx.strokeStyle = "orange";
        ctx.lineWidth = 2;

        ctx.beginPath();

        hasLoaded = true;
        
        var line = inputLine;
        ctx.moveTo(line.startX,line.startY);
        ctx.lineTo(line.endX,line.endY);
        ctx.stroke();


        isDrawing && ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        if (isDrawing) {
            ctx.strokeStyle = "darkred";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(startX,startY);
            ctx.lineTo(mouseX,mouseY);
            ctx.stroke();
        }
    }

    function onReferenceDown(e) {
        if (hasLoaded && e.button === 0) {
            if (!isDrawing) {
                startX = e.clientX - bounds.left;
                startY = e.clientY - bounds.top;
                
                isDrawing = true;
            }
            
            draw();
        }
    }
    
    function onReferenceUp(e) {
        if (hasLoaded && e.button === 0) {
            if (isDrawing) {
                inputLine = {
                    startX: startX,
                    startY: startY,
                    endX: mouseX,
                    endY: mouseY
                };

                setInputReference(inputLine)
                
                isDrawing = false;
            }
            
            draw();
        }
    }
    
    function onReferenceMove(e) {
        if (hasLoaded) {
            mouseX = e.clientX - bounds.left;
            mouseY = e.clientY - bounds.top;
            
            if (isDrawing) {
                draw();
            }
        }
    } 

    function onBgDown (e){
        let cs = bgCanvasRef.current;
        bounds = cs.getBoundingClientRect();

        isDragging = true;
        dragStartPosition = [e.clientX - bounds.left, e.clientY - bounds.top]
    }

    function onBgUp (e){
        let cs = bgCanvasRef.current;
        bounds = cs.getBoundingClientRect();

        mouseX = e.clientX - bounds.left;
        mouseY = e.clientY - bounds.top;

        isDragging = false;
        //imagePosition.current = [mouseX - dragStartPosition[0], mouseY - dragStartPosition[1]];
        dragStartPosition = [];
        //console.log("IMAGE POSTION ON MOUSE UP: ", imagePosition.current);
    }

    function onBgMove (e){
        let cs = bgCanvasRef.current;
        bounds = cs.getBoundingClientRect();

        mouseX = e.clientX - bounds.left;
        mouseY = e.clientY - bounds.top;

        if(isDragging){
            //console.log("DRAGGING NOW");
            //imagePosition.current = [mouseX, mouseY];
            console.log("OLD POSITION: ", imagePosition.current);
            imagePosition.current = [mouseX - dragStartPosition[0], mouseY - dragStartPosition[1]];
            console.log("NEW POSITION: ", imagePosition.current);
            window.requestAnimationFrame(drawBg);
        }
    }

    const loadDrawingCanvas = () => {
        drawingCanvas = drawingCanvasRef.current;
        drawingCanvas.width = 1200;
        drawingCanvas.height = 600;
        drawingCanvas.onmousedown = onReferenceDown;
        drawingCanvas.onmouseup = onReferenceUp;
        drawingCanvas.onmousemove = onReferenceMove;
        
        bounds = drawingCanvas.getBoundingClientRect();
        ctx = drawingCanvas.getContext("2d");
        
        draw();
    }
  
    window.onload = function() {
        let bgCanvas = bgCanvasRef.current;
        bgCanvas.width = 1200;
        bgCanvas.height = 600;

        bgCanvas.onmousedown = onBgDown;
        bgCanvas.onmouseup = onBgUp;
        bgCanvas.onmousemove = onBgMove;

        bounds = bgCanvas.getBoundingClientRect();
        ctx = bgCanvas.getContext("2d");
        ctx.fillStyle = "white";
        ctx.fillRect(0,0,bgCanvas.width,bgCanvas.height);
        bgCanvas && console.log("canvas loaded")
    }

    const loadBgCanvas = () => {

    }

    const drawBg = () => {
        let cs = bgCanvasRef.current;
        let ctx = cs.getContext("2d");
        let bgImage = new Image(); 

        console.log("CURRENT IMAGE POSITION: ", imagePosition.current);

        ctx.clearRect(0, 0, cs.width, cs.height);

        //console.log("INPUT FILE: ", inputFile);
        //console.log("FILE REF: ", imageRef.current);
        
        bgImage.src = imageRef.current ? URL.createObjectURL(imageRef.current) : URL.createObjectURL(inputFile);
        //bgImage.srcObject = file;
        //bgImage.srcObject = URL.createObjectURL(inputFile);
        //bgImage.src = "http://i.imgur.com/yf6d9SX.jpg";

        /*ctx.translate( 1200/2, 600/2 );
        ctx.rotate( angle * Math.PI / 180 );
        ctx.translate( -(1200/2), -(600/2) );*/

        console.log(cs.width, cs.height)
        
        /*
        // define a rectangle to rotate
        var rect={ x:100, y:100, width:175, height:50 };

        // draw the rectangle unrotated
        ctx.fillRect( rect.x, rect.y, rect.width, rect.height );

        // draw the rectangle rotated by 45 degrees (==PI/4 radians)
        ctx.translate( rect.x+rect.width/2, rect.y+rect.height/2 );
        ctx.rotate( angle * Math.PI / 180 );
        ctx.translate( -rect.x-rect.width/2, -rect.y-rect.height/2 );
        ctx.fillRect( rect.x, rect.y, rect.width, rect.height );*/

        bgImage.onload = function (){            
            //cs.getContext("2d").drawImage(bgImage, imagePosition.current[0], imagePosition.current[1])
            ctx.drawImage(bgImage, imagePosition.current[0], imagePosition.current[1]);
        }

        /*// undo #3
        ctx.translate( 1200/2, 600/2 );
        // undo #2
        ctx.rotate( -(angle * Math.PI / 180) );
        // undo #1
        ctx.translate( -(1200/2), 600/2 );*/

        bgImage.onerror = failed;
    }

    const onChangeInputFile = (e) => {
        if (e.target.files){
            console.log("FILE UPLOADED: ", e.target.files[0])
            setInputFile(e.target.files[0]);
        }
    }

    function failed() {
        console.error("The provided file couldn't be loaded as an Image media");
    }

    const [inputLength, setInputLength] = useState(0);
    const [inputReference, setInputReference] = useState({});
    const [inputFile, setInputFile] = useState();
    const imageRef = React.useRef();
    const [editImage, setEditImage] = useState(false);
    const [angle, setAngle] = useState(0);
    const drawingCanvasRef = React.useRef();
    const bgCanvasRef = React.useRef();
    const imagePosition = React.useRef([]);

    const onHandleInputChange = (e) => {
        setInputLength(e.target.value)
    }

    const onSubmit = () => {
        if (inputFile && (Object.keys(inputReference).length !== 0 && inputReference.constructor === Object) && inputLength){
            console.log("IMG, REF, LÄNGE: ", inputFile, inputReference, inputLength);
            onHandleSubmit({
                "image": inputFile,
                "inputRef": inputReference,
                "inputLength": inputLength
            })
        } else {
            alert("BITTE ERST ALLE INFORMATIONEN AUSFÜLLEN")
        }
    }

    useEffect(() => { 
        //console.log("INPUT CHANGED") 
        imageRef.current = inputFile;     
        if(inputFile){
            console.log("CHANGING IMAGE POSITION IN USEFFFECT")
            imagePosition.current = [0,0];
            drawBg();
            loadDrawingCanvas();
        }
    }, [inputFile])

    useEffect(() => {
        console.log("REDRAWN AFTER STATE SET", angle);
        angle !== 0 && window.requestAnimationFrame(drawBg);
    }, [angle, drawBg])

    return (
        <Wrapper>
            <h5>Reference Grid</h5>            
            <input onChange={(e) => onChangeInputFile(e)} type="file" id="input-img" accept=".png, .jpg, .jpeg"></input>
            <button hidden={!inputFile} onClick={() => setEditImage(!editImage)}>{editImage ? "Bild sichern" : "Bild bearbeiten"}</button>
            {  editImage &&
                <input type="number" min="-180" max="180" value={angle} onChange={(e) => setAngle(e.target.value)} placeholder="Winkel"></input>
            }
            <CanvasWrapper>
                <Canvas ref={bgCanvasRef} style={{cursor: editImage && "all-scroll"}} id="bgCanvas"></Canvas>
                <Canvas hidden={!inputFile || editImage} ref={drawingCanvasRef} id="drawingCanvas"></Canvas>
            </CanvasWrapper>
            <InputWrapper>
                <input id="input" type="number" placeholder="Länge in Metern" value={inputLength} onChange={(e) => onHandleInputChange(e)}></input>
                <button onClick={() => onSubmit()}>Weiter --></button>  
            </InputWrapper>
        </Wrapper>
    )
}

export default ReferenceGrid//
