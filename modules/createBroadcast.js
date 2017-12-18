import React from "react"
import PropTypes from "prop-types"
import invariant from "invariant"

function createBroadcast(initialValue) {
  let subscribers = []
  let currentValue = initialValue

  const publish = value => {
    currentValue = value
    subscribers.forEach(subscriber => subscriber(currentValue))
  }

  const subscribe = subscriber => {
    subscribers.push(subscriber)
    return () => (subscribers = subscribers.filter(item => item !== subscriber))
  }

  let broadcastInstance = null

  /**
   * A <Broadcast> is a container for a "value" that its <Subscriber>
   * may subscribe to. A <Broadcast> may only be rendered once.
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

    componentDidMount() {
      invariant(
        broadcastInstance == null,
        "You cannot render the same <Broadcast> twice! There must be only one source of truth. " +
          "Instead of rendering another <Broadcast>, just change the `value` prop of the one " +
          "you already rendered."
      )

      broadcastInstance = this

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

    componentWillUnmount() {
      if (broadcastInstance === this) {
        broadcastInstance = null
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
    static propTypes = {
      children: PropTypes.func
    }

    state = {
      value: currentValue
    }

    componentDidMount() {
      this.unsubscribe = subscribe(value => {
        this.setState({ value })
      })
    }

    componentWillUnmount() {
      if (this.unsubscribe) {
        this.unsubscribe()
      }
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
