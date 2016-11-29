import invariant from 'invariant'
import React, { PropTypes } from 'react'

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
    return this.context.broadcasts[this.props.channel]
  }

  componentWillMount() {
    const broadcast = this.getBroadcast()

    invariant(
      broadcast,
      '<Subscriber channel="%s"> must be rendered in the context of a <Broadcast channel="%s">',
      this.props.channel,
      this.props.channel
    )

    this.setState({
      value: broadcast.getValue()
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
