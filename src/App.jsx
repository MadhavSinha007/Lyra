import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import LyraLandingPage from './LyraLandingPage'
import EmotionAnalysisPage from './Analysis'

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element =  {<LyraLandingPage/>}/>
        <Route path="/analysis" element ={<EmotionAnalysisPage/>}/>
      </Routes>
    </Router>
  )
}

export default App
