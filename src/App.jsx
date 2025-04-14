import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import LyraLandingPage from './LyraLandingPage'
import EmotionAnalysisPage from './Analysis'
import LyraChatbot from './components/AIChatbot'

function App() {
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