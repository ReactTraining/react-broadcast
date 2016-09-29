import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { GeoProvider } from './coords'
import './index.css'

ReactDOM.render(
  <GeoProvider><App /></GeoProvider>,
  document.getElementById('root')
)
