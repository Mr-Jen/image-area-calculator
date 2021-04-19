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

  const handleInputLengthChange = (length) => {
    setInputLength(length)
  }

  const handleInputRefChange = (ref) => {
    setInputRef(ref)
  }

  const [showReferenceGrid, setShowReferenceGrid] = useState(true);
  const [inputLength, setInputLength] = useState(0);
  const [inputRef, setInputRef] = useState({});

  return (
    <Wrapper className="App">
      <h2 style={{margin: "auto"}}>Area Calculation</h2>
      {showReferenceGrid ? 
        <ReferenceGrid 
          onClickContinue={handleContentChange}
          onChangeInput={(length) => handleInputLengthChange(length)}
          onChangeRef={(ref) => handleInputRefChange(ref)}
        /> : 
        <DrawingGrid input={[inputLength, inputRef]}/>}
        <button onClick={() => setShowReferenceGrid(!showReferenceGrid)}>Switch</button>
    </Wrapper>
  );
}

export default App;
