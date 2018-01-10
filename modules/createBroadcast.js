import React from "react"
import PropTypes from "prop-types"
import warning from "warning"

function createBroadcast(initialValue) {
  let currentValue = initialValue
  let subscribers = []

  const publish = value => {
    currentValue = value
    subscribers.forEach(s => s(currentValue))
  }

  const subscribe = subscriber => {
    subscribers.push(subscriber)

    return () => {
      subscribers = subscribers.filter(s => s !== subscriber)
    }
  }

  const channel = Symbol()

  /**
   * A <Broadcast> is a container for a "value" that its <Subscriber>
   * may subscribe to.
   */
  class Broadcast extends React.Component {
    /**
     * For convenience when setting up a component that tracks this <Broadcast>'s
     * value in state.
     *
     *     const { Broadcast, Subscriber } = createBroadcast("value")
     *
     *     class MyComponent {
     *       state = {
     *         broadcastValue: Broadcast.initialValue
     *       }
     *
     *       // ...
     *
     *       render() {
     *         return <Broadcast value={this.state.broadcastValue}/>
     *       }
     *     }
     */
    static initialValue = initialValue

    static contextTypes = {
      broadcasts: PropTypes.object
    }

    static childContextTypes = {
      broadcasts: PropTypes.object.isRequired
    }

    getChildContext() {
      return {
        broadcasts: {
          ...this.context.broadcasts,
          [channel]: true
        }
      }
    }

    componentDidMount() {
      if (this.props.value !== currentValue) {
        // TODO: Publish and warn about the double render
        // problem if there are existing subscribers? Or
        // just ignore the discrepancy?
      }
    }

    componentWillReceiveProps(nextProps) {
      if (this.props.value !== nextProps.value) {
        publish(nextProps.value)
      }
    }

    render() {
      return this.props.children
    }
  }

  /**
   * A <Subscriber> sets state whenever its <Broadcast value> changes
   * and calls its render prop with the result.
   */
  class Subscriber extends React.Component {
    static contextTypes = {
      broadcasts: PropTypes.object
    }

    static propTypes = {
      children: PropTypes.func,
      quiet: PropTypes.bool
    }

    static defaultProps = {
      quiet: false
    }

    state = {
      value: currentValue
    }

    componentDidMount() {
      const broadcasts = this.context.broadcasts
      const inContext = broadcasts && broadcasts[channel]

      warning(
        inContext || this.props.quiet,
        "<Subscriber> was rendered outside the context of its <Broadcast>"
      )

      if (inContext) {
        this.unsubscribe = subscribe(value => {
          this.setState({ value })
        })
      }
    }

    componentWillUnmount() {
      if (this.unsubscribe) this.unsubscribe()
    }

    render() {
      const { children } = this.props
      return children ? children(this.state.value) : null
    }
  }

  return {
    Broadcast,
    Subscriber
  }
}

export default createBroadcast
