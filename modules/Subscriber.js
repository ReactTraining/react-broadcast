import React from "react"
import PropTypes from "prop-types"
import invariant from "invariant"

/**
 * A <Subscriber> pulls the value for a channel off of context.broadcasts
 * and passes it to its children function.
 */
class Subscriber extends React.Component {
  static propTypes = {
    channel: PropTypes.string.isRequired,
    children: PropTypes.func,
  }

  static contextTypes = {
    broadcasts: PropTypes.object
  }

  state = {
    value: null
  }

  getBroadcast() {
    const broadcasts = this.context.broadcasts || {}
    const broadcast = broadcasts[this.props.channel]

    invariant(
      broadcast,
      '<Subscriber channel="%s"> must be rendered in the context of a <Broadcast channel="%s">',
      this.props.channel,
      this.props.channel
    )

    return broadcast
  }

  componentWillMount() {
    this.setState({
      value: this.getBroadcast().getState()
    })
  }

  componentDidMount() {
    this.unsubscribe = this.getBroadcast().subscribe(value => {
      this.setState({ value })
    })
  }

  componentWillUnmount() {
    this.unsubscribe()
  }

  render() {
    const { children } = this.props
    return children ? children(this.state.value) : null
  }
}

export default Subscriber
