import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

console.log('MAKEUP_NK: main.tsx START')

const el = document.getElementById('root')
if (!el) {
  console.error('MAKEUP_NK: DIV#root NOT FOUND')
  alert('MAKEUP_NK: DIV#root NOT FOUND')
  throw new Error('DIV#root not found')
}

createRoot(el).render(<App />)

console.log('MAKEUP_NK: main.tsx RENDER CALLED')
alert('MAKEUP_NK: main.tsx executed')
