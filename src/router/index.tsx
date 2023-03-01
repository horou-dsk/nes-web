import React from 'react'
import { BrowserRouter as Router, Route, Switch } from "react-router-dom"
import Emulator from '../pages/emulator/Emulator'
import Home from "../pages/home/Home"

function Index() {
  return (
    <Router>
      <Switch>
        <Route path="/" exact>
          <Home />
        </Route>
        <Route path="/nes">
          <Emulator />
        </Route>
      </Switch>
    </Router>
  )
}

export default Index
