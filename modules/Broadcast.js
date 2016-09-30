import invariant from 'invariant'
import React, { PropTypes } from 'react'
import {
  broadcasts as broadcastsType
} from './PropTypes'

const createBroadcast = (initialValue) => {
  let listeners = []
  let currentValue = initialValue

  return {
    publish(value) {
      currentValue = value
      listeners.forEach(listener => listener(currentValue))
    },
    subscribe(listener) {
      listeners.push(listener)

      // Publish to this subscriber once immediately.
      listener(currentValue)

      return () =>
        listeners = listeners.filter(item => item !== listener)
    }
  }
}

/**
 * A <Broadcast> provides a generic way for descendants to "subscribe"
 * to some value that changes over time, bypassing any intermediate
 * shouldComponentUpdate's in the hierarchy. It puts all subscription
 * functions on context.broadcasts, keyed by "channel".
 *
 * To use it, a subscriber must opt-in to context.broadcasts. See the
 * <Subscriber> component for a reference implementation.
 */
class Broadcast extends React.Component {
  static contextTypes = {
    broadcasts: broadcastsType
  }

  static propTypes = {
    channel: PropTypes.string.isRequired,
    value: PropTypes.any
  }

  static childContextTypes = {
    broadcasts: broadcastsType.isRequired
  }

  getBroadcastsContext() {
    const { channel } = this.props
    const { broadcasts } = this.context

    return {
      ...broadcasts,
      [channel]: this.broadcast.subscribe
    }
  }

  getChildContext() {
    return {
      broadcasts: this.getBroadcastsContext()
    }
  }

  componentWillMount() {
    this.broadcast = createBroadcast(this.props.value)
  }

  componentWillReceiveProps(nextProps) {
    invariant(
      this.props.channel === nextProps.channel,
      'You cannot change <Broadcast channel>'
    )

    if (this.props.value !== nextProps.value)
      this.broadcast.publish(nextProps.value)
  }

  render() {
    return React.Children.only(this.props.children)
  }
}

export default Broadcast
