import invariant from 'invariant'
import React, { PropTypes } from 'react'
import {
  broadcasts as broadcastsType
} from './PropTypes'

class Subscriber extends React.Component {
  static contextTypes = {
    broadcasts: broadcastsType.isRequired
  }

  static propTypes = {
    channel: PropTypes.string.isRequired
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

    subscribe(value => {
      // This function will be called once immediately.
      this.setState({ value })
    })
  }

  render() {
    return this.props.children(this.state.value)
  }
}

export default Subscriber
