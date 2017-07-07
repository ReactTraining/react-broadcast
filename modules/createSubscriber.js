import invariant from 'invariant'
import React from 'react'
import PropTypes from 'prop-types'

const createSubscriber = channel => BaseComponent => {
  return class Subscriber extends React.Component {
    static contextTypes = {
      broadcasts: PropTypes.object
    }

    state = {
      value: null
    }

    getBroadcast() {
      const broadcast = this.context.broadcasts[channel]

      invariant(
        broadcast,
        '<Subscriber channel="%s"> must be rendered in the context of a <Broadcast channel="%s">',
        this.channel,
        this.channel
      )

      return broadcast
    }

    componentWillMount() {
      const broadcast = this.getBroadcast()
      this.setState({
        value: broadcast.getState()
      })
    }

    componentDidMount() {
      const broadcast = this.getBroadcast()
      this.unsubscribe = broadcast.subscribe(value => {
        this.setState({ value })
      })
    }

    componentWillUnmount() {
      this.unsubscribe()
    }

    render() {
      const props = {...this.props, [channel]: this.state.value }
      return <BaseComponent {...props} />
    }
  }
}

export default createSubscriber
