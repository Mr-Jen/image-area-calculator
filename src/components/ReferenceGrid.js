import React, {useState, useEffect} from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`
const CanvasWrapper = styled.div`
    width: 1200;
    height: 600;
    position: relative;
    margin-right: 500%;
    margin-top: 100px;
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

const ReferenceGrid = ({onClickContinue, onChangeInput, onChangeRef}) => {

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
    
    function draw() {
        
        let drawingCanvas = drawingCanvasRef.current;
        let ctx = drawingCanvas.getContext("2d");
        let canvasHeight = 600;
        let canvasWidth = 1200;
        //ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.strokeStyle = "grey";
        ctx.strokeWidth = .1;
        ctx.strokeRect(0,0,canvasWidth,canvasHeight);
        
        ctx.strokeStyle = "green";
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
        bounds = bgCanvas.getBoundingClientRect();
        ctx = bgCanvas.getContext("2d");
        ctx.fillStyle = "white";
        ctx.fillRect(0,0,bgCanvas.width,bgCanvas.height);
        bgCanvas && console.log("canvas loaded")
    }

    const drawBg = () => {
        let cs = bgCanvasRef.current;
        console.log("DRAWING BG")
        let bgImage = new Image();        
        bgImage.src = URL.createObjectURL(inputFile);
        //bgImage.src = "http://i.imgur.com/yf6d9SX.jpg";
        bgImage.onload = function (){            
            cs.getContext("2d").drawImage(bgImage, 0, 0)
        }
    }

    const onChangeInputFile = (e) => {
        if (e.target.files){
            console.log("FILE UPLOADED: ", e.target.files[0])
            setInputFile(e.target.files[0]);
        }
        /*var img = new Image();
        img.onload = draw_img;
        img.onerror = failed;
        img.src = URL.createObjectURL(e.target.files[0])*/
    }

    function failed() {
        console.error("The provided file couldn't be loaded as an Image media");
    }
    function succeeded() {
        console.log("Image uploaded!")
    }

    const [inputLength, setInputLength] = useState(0);
    const [inputReference, setInputReference] = useState({});
    const [inputFile, setInputFile] = useState();
    const drawingCanvasRef = React.useRef();
    const bgCanvasRef = React.useRef();

    const onHandleInputChange = (e) => {
        setInputLength(e.target.value)
    }

    useEffect(() => {        
        console.log("FILE UNKNOWN: ", inputFile)
        if(inputFile){
            drawBg();
            loadDrawingCanvas();
        }
    }, [inputFile])

    useEffect(() => {
        onChangeInput(inputLength)
    }, [inputLength, onChangeInput])

    useEffect(() => {
        console.log("INPUT REF: ", inputReference)
        onChangeRef(inputReference)
    }, [inputReference, onChangeRef])

    return (
        <Wrapper>
            <h5>Reference Grid</h5>            
            <input onChange={(e) => onChangeInputFile(e)} type="file" id="input-img" accept=".png, .jpg, .jpeg" id="file_input"></input>
            <CanvasWrapper>
                <Canvas ref={bgCanvasRef} id="bgCanvas"></Canvas>
                <Canvas hidden={!inputFile} ref={drawingCanvasRef} id="drawingCanvas"></Canvas>
            </CanvasWrapper>
            <InputWrapper>
                <input id="input" type="number" placeholder="Länge in Metern" value={inputLength} onChange={(e) => onHandleInputChange(e)}></input>
                <button onClick={() => onClickContinue()}>Weiter --></button>  
            </InputWrapper>
        </Wrapper>
    )
}

export default ReferenceGrid
