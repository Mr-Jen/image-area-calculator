import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: stretch;
    height: 130px;
    width: 100px;
    background-color: white; 
    outline: 2px solid black;  
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin-left: ${props => props.marginLeft}px;
    margin-top: ${props => props.marginTop}px;
`

const MenuElementButton = styled.button`
    border: none;    
    flex-grow: 1;
    background-color: yellow;
    outline: 1px solid black;
`

const MenuText = styled.p`
    text-align: center;
    font-weight: 800;
`

const ContextMenu = ({marginLeft, marginTop, onDeleteNode, onCloseMenu}) => {
    return (
        <Wrapper marginLeft={marginLeft} marginTop={marginTop}>
            <MenuElementButton>
                <MenuText>Edit</MenuText>
            </MenuElementButton>
            <MenuElementButton onClick={() => onDeleteNode()}>
                <MenuText>Delete</MenuText>
            </MenuElementButton>
            <button
                style={{boder: "none", padding: "5px"}}
                onClick={() => onCloseMenu()}
            >Schließen</button>
        </Wrapper>
    )
}

export default ContextMenu
