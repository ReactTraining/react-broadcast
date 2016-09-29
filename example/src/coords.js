import React from 'react'
import { createContextEmitter, createContextSubscriber } from '../../index'

const GeoEmitter = createContextEmitter('geo')
const GeoSubscriber = createContextSubscriber('geo')

class GeoProvider extends React.Component {

  static propTypes = {
    children: React.PropTypes.node
  }

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
      <GeoEmitter value={this.state.geo}>
        {this.props.children}
      </GeoEmitter>
    )
  }

}

export { GeoProvider, GeoSubscriber }
