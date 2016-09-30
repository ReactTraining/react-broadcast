import invariant from 'invariant'
import React, { PropTypes } from 'react'

/**
 * A <Subscriber> pulls the value for a channel off of context.broadcasts
 * and passes it to its children function.
 */
class Subscriber extends React.Component {
  static contextTypes = {
    broadcasts: React.PropTypes.object
  }

  state = {
    value: null
  }

  componentWillMount() {
    const { channel } = this.props

    if (this.context.broadcasts) {
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
  }

  componentWillUnmount() {
    this.unsubscribe()
  }

  render() {
    return this.props.children(this.state.value)
  }
}

if (__DEV__) {
  Subscriber.propTypes = {
    channel: PropTypes.string.isRequired,
    children: PropTypes.func.isRequired
  }
}

export default Subscriber
