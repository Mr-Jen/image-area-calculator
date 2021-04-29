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

    let imgHeight;
    let imgWidth;
    let imgPosX;
    let imgPosY;
    
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

        imgHeight = imageObjRef.current.height;
        imgWidth = imageObjRef.current.width;
        imgPosX = imagePosition.current[0];
        imgPosY = imagePosition.current[1];
        
        if ((mouseX >= imgPosX && mouseX <= imgWidth + imgPosX) && (mouseY >= imgPosY && mouseY <= imgHeight + imgPosY)){
            console.log("ON IMAGE")
            isDragging = true;
            dragStartPosition = [mouseX - imagePosition.current[0], mouseY - imagePosition.current[1]]
        }
    }

    function onBgUp (e){
        let cs = bgCanvasRef.current;
        bounds = cs.getBoundingClientRect();

        mouseX = e.clientX - bounds.left;
        mouseY = e.clientY - bounds.top;

        isDragging = false;
        dragStartPosition = [];
    }

    function onBgMove (e){
        let cs = bgCanvasRef.current;    
        bounds = cs.getBoundingClientRect();

        mouseX = e.clientX - bounds.left;
        mouseY = e.clientY - bounds.top;
        imgHeight = imageObjRef.current && imageObjRef.current.height;
        imgWidth = imageObjRef.current && imageObjRef.current.width;
        imgPosX = imagePosition.current[0];
        imgPosY = imagePosition.current[1];

        if ((mouseX >= imgPosX && mouseX <= imgWidth + imgPosX) && (mouseY >= imgPosY && mouseY <= imgHeight + imgPosY)){
            cs.style.cursor = "all-scroll"
        }
        else {
            cs.style.cursor = "default"
        }

        if(isDragging){
            imagePosition.current = [mouseX - dragStartPosition[0], mouseY - dragStartPosition[1]];
            window.requestAnimationFrame(drawBgImage);
        }
    }

    function onBgOut (e){
        isDragging = false;
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
        bgCanvas.onmouseout = onBgOut;

        bounds = bgCanvas.getBoundingClientRect();
        ctx = bgCanvas.getContext("2d");
        ctx.fillStyle = "white";
        ctx.fillRect(0,0,bgCanvas.width,bgCanvas.height);
        bgCanvas && console.log("canvas loaded")
    }

    const loadImage = (path) => {
        let bgImage = new Image();
        let promise = new Promise((resolve, reject) => {
          bgImage.onload = () => resolve(bgImage);
          bgImage.onerror = reject;
        });
        bgImage.src = path;
        return promise;
    }
      

    function drawBgImage() {
        let cs = bgCanvasRef.current;
        let ctx = cs.getContext("2d");

        ctx.clearRect(0, 0, cs.width, cs.height);
        ctx.save();

        ctx.translate( 1200/2, 600/2 );
        ctx.rotate( angle * Math.PI / 180 );
        ctx.translate( -(1200/2), -(600/2) );

        imageObjRef.current && ctx.drawImage(imageObjRef.current, imagePosition.current[0], imagePosition.current[1]);

        ctx.restore();

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


        /*// undo #3
        ctx.translate( 1200/2, 600/2 );
        // undo #2
        ctx.rotate( -(angle * Math.PI / 180) );
        // undo #1
        ctx.translate( -(1200/2), 600/2 );*/

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
    const imageObjRef = React.useRef();

    const onHandleInputChange = (e) => {
        setInputLength(e.target.value)
    }

    const onSubmit = () => {
        if (inputFile && (Object.keys(inputReference).length !== 0 && inputReference.constructor === Object) && inputLength){
            //console.log("IMG, REF, LÄNGE: ", inputFile, inputReference, inputLength);
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
        imageRef.current = inputFile;     
        if(inputFile){
            console.log("CHANGING IMAGE POSITION IN USEFFFECT")
            imagePosition.current = [0,0];
            let imgSrc = imageRef.current ? URL.createObjectURL(imageRef.current) : URL.createObjectURL(inputFile);
            loadImage(imgSrc).then((image) => {
                imageObjRef.current = image;
                drawBgImage();
                loadDrawingCanvas();
            });
        }
    }, [inputFile])

    useEffect(() => {
        //console.log("REDRAWN AFTER STATE SET", angle);
        window.requestAnimationFrame(drawBgImage);
    }, [angle])

    return (
        <Wrapper>
            <h5>Reference Grid</h5>            
            <input onChange={(e) => onChangeInputFile(e)} type="file" id="input-img" accept=".png, .jpg, .jpeg"></input>
            <button hidden={!inputFile} onClick={() => setEditImage(!editImage)}>{editImage ? "Bild sichern" : "Bild bearbeiten"}</button>
            {  editImage &&
                <input type="number" step="0.01" min="-180" max="180" value={angle} onChange={(e) => setAngle(e.target.value)} placeholder="Winkel"></input>
            }
            <CanvasWrapper>
                <Canvas ref={bgCanvasRef} id="bgCanvas"></Canvas>
                <Canvas hidden={!inputFile || editImage} ref={drawingCanvasRef} id="drawingCanvas"></Canvas>
            </CanvasWrapper>
            <InputWrapper>
                <input id="input" type="number" placeholder="Länge in Metern" value={inputLength} onChange={(e) => onHandleInputChange(e)}></input>
                <button onClick={() => onSubmit()}>Weiter --></button>  
            </InputWrapper>
        </Wrapper>
    )
}

export default ReferenceGrid
