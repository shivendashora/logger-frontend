import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {BrowserRouter} from 'react-router-dom'
import Navbar from './components/navbar/index.tsx'
import { CardsProvider } from './context/cards-provider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <CardsProvider>
        <div className="h-dvh flex flex-col overflow-hidden">
          <Navbar/>
          <App/>
        </div>
      </CardsProvider>
    </BrowserRouter>
  </StrictMode>,
)
