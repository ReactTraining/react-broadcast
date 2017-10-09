import warning from 'warning'
import React from 'react'
import PropTypes from 'prop-types'

import createBroadcast from './create-broadcast';

/**
 * A <Subscriber> pulls the value for a channel off of context.broadcasts
 * and passes it to its children function.
 */
class Subscriber extends React.Component {
  static propTypes = {
    channel: PropTypes.string.isRequired,
    children: PropTypes.func.isRequired
  }

  static contextTypes = {
    broadcasts: PropTypes.object
  }

  state = {
    value: null
  }

  getBroadcast() {
    const broadcast = (
      this.context &&
      this.context.broadcasts &&
      this.context.broadcasts[this.props.channel]
    )

    warning(
      broadcast,
      '<Subscriber channel="%s"> should be rendered in the context of a <Broadcast channel="%s">',
      this.props.channel,
      this.props.channel
    )

    return broadcast || createBroadcast()
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
    return this.props.children(this.state.value)
  }
}

export default Subscriber
