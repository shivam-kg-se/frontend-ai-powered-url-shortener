import './App.css'
import { BrowserRouter as Router } from 'react-router-dom'
import { getApps } from './utils/helper'
import ThemeProvider from './contextApi/ThemeContext'

function App() {

  const CurrentApp = getApps();

  return (
    <ThemeProvider>
      <Router>
        <CurrentApp />
      </Router>
    </ThemeProvider>
  )
}

export default App
