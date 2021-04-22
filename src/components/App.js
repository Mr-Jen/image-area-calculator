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

  const handleSubmit = (data) => {
    console.log("DATA FROM REFERENCE: ", data);
    setInputData(data);
    setShowReferenceGrid(false);
  }

  const [showReferenceGrid, setShowReferenceGrid] = useState(true);
  const [inputData, setInputData] = useState({});

  return (
    <Wrapper className="App">
      <h2 style={{margin: "auto"}}>Area Calculation</h2>
      {showReferenceGrid ? 
        <ReferenceGrid 
          onHandleSubmit={(data) => handleSubmit(data)}
        /> : 
        <DrawingGrid inputData={inputData}/>}
        <button onClick={() => setShowReferenceGrid(!showReferenceGrid)}>Switch</button>
    </Wrapper>
  );
}

export default App;
