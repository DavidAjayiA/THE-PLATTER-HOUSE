import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { CartProvider } from './CartContext.jsx'
import { MenuProvider } from './MenuContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CartProvider>
      <MenuProvider>
        <App />
      </MenuProvider>
    </CartProvider>
  </React.StrictMode>,
)
