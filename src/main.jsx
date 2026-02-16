import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

window.__FRONT_BUILD_ID__ = 'FRONT_BUILD_CHECK_V3_20260216_1558'

const root = createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
