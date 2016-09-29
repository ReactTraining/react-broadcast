import React from 'react'
import createContextEmission from 'react-context-emission'

const { GeoEmitter, GeoSubscriber } = createContextEmission('geo')

class GeoProvider extends React.Component {

  state = {
    geo: null
  }

  componentDidMount() {
    navigator.geolocation.watchPosition((geo) => {
      this.setState({ geo })
    })
  }

  render() {
    return (
      <GeoEmitter geo={this.state.geo}>
        {this.props.children}
      </GeoEmitter>
    )
  }

}

export { GeoProvider, GeoSubscriber }
