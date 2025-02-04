import React from 'react'
import Graph from './components/Graph'
import GraphWithCSV from './components/Graph2'
import GraphWithCSV2 from './components/Graph3'
import LineChart from './components/Graph4'

function App() {
  return (
    <div className='w-[50%] overflow-auto'>
      <h2>Data Visualization</h2>
      <LineChart />
    </div>
  )
}

export default App