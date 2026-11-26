import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { FoodProvider } from './context/FoodContext'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FoodProvider>
      <App />
    </FoodProvider>
  </StrictMode>,
)
