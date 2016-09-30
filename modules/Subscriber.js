import invariant from 'invariant'
import React, { PropTypes } from 'react'
import {
  broadcasts as broadcastsType
} from './PropTypes'

/**
 * A <Subscriber> pulls the value for a channel off of context.broadcasts
 * and passes it to its children function.
 */
class Subscriber extends React.Component {
  static contextTypes = {
    broadcasts: broadcastsType.isRequired
  }

  static propTypes = {
    channel: PropTypes.string.isRequired,
    children: PropTypes.func.isRequired
  }

  state = {
    value: null
  }

  componentWillMount() {
    const { channel } = this.props
    const subscribe = this.context.broadcasts[channel]

    invariant(
      typeof subscribe === 'function',
      '<Subscriber channel="%s"> must be rendered in the context of a <Broadcast channel="%s">',
      channel,
      channel
    )

    this.unsubscribe = subscribe(value => {
      // This function will be called once immediately.
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
