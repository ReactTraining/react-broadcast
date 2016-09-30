import invariant from 'invariant'
import React, { PropTypes } from 'react'
import {
  broadcasts as broadcastsType
} from './PropTypes'

const createBroadcast = (channel, initialValue) => {
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

  getChildContext() {
    const { broadcasts } = this.context
    const { channel } = this.props

    return {
      ...broadcasts,
      [channel]: this.broadcast.subscribe
    }
  }

  componentWillMount() {
    this.broadcast = createBroadcast(this.props.channel, this.props.value)
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
