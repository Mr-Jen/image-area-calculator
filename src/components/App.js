import React, {useState} from 'react'
import styled from 'styled-components'
import DrawingGrid from './DrawingGrid'
import ReferenceGrid from './ReferenceGrid'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80%;
  margin: auto;
`

const App = () => {

  const handleContentChange = () => {
    setShowReferenceGrid(false)
  }

  const handleInputRefChange = (length) => {
    setInputRef(length)
  }

  const [showReferenceGrid, setShowReferenceGrid] = useState(true);
  const [inputRef, setInputRef] = useState(0);

  return (
    <Wrapper className="App">
      <h2 style={{margin: "auto"}}>Area Calculation</h2>
      {showReferenceGrid ? 
        <ReferenceGrid 
          onClickContinue={handleContentChange}
          onChangeInput={(length) => handleInputRefChange(length)}
        /> : 
        <DrawingGrid inputRef={inputRef}/>}
    </Wrapper>
  );
}

export default App;
