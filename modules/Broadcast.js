import invariant from 'invariant'
import React, { PropTypes } from 'react'
import brcast from 'brcast'

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
  static propTypes = {
    channel: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    value: PropTypes.any
  }

  static contextTypes = {
    broadcasts: PropTypes.object
  }

  static childContextTypes = {
    broadcasts: PropTypes.object.isRequired
  }

  broadcast = brcast(this.props.value)

  getChildContext() {
    return {
      broadcasts: {
        ...this.context.broadcasts,
        [this.props.channel]: this.broadcast
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    invariant(
      this.props.channel === nextProps.channel,
      'You cannot change <Broadcast channel>'
    )

    if (this.props.value !== nextProps.value)
      this.broadcast.setState(nextProps.value)
  }

  render() {
    return React.Children.only(this.props.children)
  }
}

export default Broadcast
