import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import LyraLandingPage from './LyraLandingPage'
import EmotionAnalysisPage from './Analysis'
import LyraChatbot from './components/AIChatbot'
import LYRALoadingAnimation from './components/LYRALoading'


function App() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Set loading to false after 10 seconds (duration of the animation)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 10000) // 10 seconds

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <LYRALoadingAnimation />
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LyraLandingPage />} />
        <Route path="/analysis" element={<EmotionAnalysisPage />} />
        <Route path="/chatbot" element={<LyraChatbot />} />
      </Routes>
    </Router>
  )
}

export default App