import React, { Component } from 'react'
import { GeoSubscriber } from './coords'

class ShouldComponentUpdateNeverHAHA extends React.Component {

  shouldComponentUpdate() {
    return false
  }

  render() {
    return (
      <div>
        <p>Even though I say I will never update, the stuff below can.</p>
        <GeoSubscriber>
          {({ geo }) => geo ? (
            <dl>
              <dt>latitude</dt>
              <dd>{geo.coords.latitude}</dd>
              <dt>longitude</dt>
              <dd>{geo.coords.longitude}</dd>
            </dl>
          ) : (
            <p>Getting geoposition...</p>
          )}
        </GeoSubscriber>
      </div>
    )
  }
}

class App extends Component {
  render() {
    return (
      <div>
        <h1>React Context Emission Example</h1>
        <ShouldComponentUpdateNeverHAHA/>
      </div>
    )
  }
}

export default App
