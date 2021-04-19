import React, {useState, useEffect} from 'react'
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

const ReferenceGrid = ({onClickContinue, onChangeInput, onChangeRef}) => {

    var canvas = null;
    var bounds = null;
    var ctx = null;
    var hasLoaded = false;
    
    var startX = 0;
    var startY = 0;
    var mouseX = 0;
    var mouseY = 0;
    var isDrawing = false;
    let inputLine = {}
    
    function draw() {

        let canvas = document.getElementById("canvas");
        let canvasHeight = canvas.height;
        let canvasWidth = canvas.width;
        ctx.fillStyle = "white";
        ctx.fillRect(0,0,canvasWidth,canvasHeight);
        
        ctx.strokeStyle = "green";
        ctx.lineWidth = 2;

        //let img = new Image;
        let img = document.getElementById("image");
        ctx.drawImage(img, 0, 0);
        //img.src = "/assets/rect-test-area.jpg"

        ctx.beginPath();

        /*for (let i = 0; i <= 10; i++){
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
        
        var line = inputLine;
        ctx.moveTo(line.startX,line.startY);
        ctx.lineTo(line.endX,line.endY);
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
  
    window.onload = function() {
        canvas = document.getElementById("canvas");
        let img = document.getElementById("image");
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.onmousedown = onReferenceDown;
        canvas.onmouseup = onReferenceUp;
        canvas.onmousemove = onReferenceMove;
        
        bounds = canvas.getBoundingClientRect();
        ctx = canvas.getContext("2d");
        
        draw();
    }

    const [inputLength, setInputLength] = useState(0);
    const [inputReference, setInputReference] = useState({});

    const onHandleInputChange = (e) => {
        setInputLength(e.target.value)
    }

    useEffect(() => {
        //console.log("STATE UPDATED", inputLength)
        onChangeInput(inputLength)
    }, [inputLength])

    useEffect(() => {
        console.log("INPUT REF: ", inputReference)
        onChangeRef(inputReference)
    }, [inputReference])

    return (
        <Wrapper>
            <h5>Reference Grid</h5>
            <canvas id="canvas"></canvas>
            <InputWrapper>
                <input id="input" type="number" placeholder="Länge in Metern" value={inputLength} onChange={(e) => onHandleInputChange(e)}></input>
                <button onClick={() => onClickContinue()}>Weiter --></button>  
            </InputWrapper>
            <img hidden={true} id="image" src="/assets/rect-test-area.jpg"></img>
        </Wrapper>
    )
}

export default ReferenceGrid
