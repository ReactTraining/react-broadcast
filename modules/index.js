import React, { PropTypes } from 'react'

const createContextEmitter = (contextKey) => (

  class Emitter extends React.Component {

    static propTypes = {
      children: PropTypes.node,
      value: PropTypes.any
    }

    static childContextTypes = {
      [contextKey]: PropTypes.object
    }

    constructor() {
      super()
      this.subscribers = []
    }

    getChildContext() {
      return {
        [contextKey]: {
          getInitialValue: () => {
            return this.props.value
          },

          subscribe: (subscriber) => {
            this.subscribers.push(subscriber)
            return () => {
              this.subscribers = this.subscribers.filter(
                alleged => alleged !== subscriber
              )
            }
          }
        }
      }
    }

    componentWillReceiveProps(nextProps) {
      this.subscribers.forEach(f => f(nextProps.value))
    }

    render() {
      return this.props.children
    }

  }
)

const createContextSubscriber = (contextKey) => (

  class Subscriber extends React.Component {

    static propTypes = {
      children: PropTypes.func
    }

    static contextTypes = {
      [contextKey]: PropTypes.object
    }

    constructor(props, context) {
      super()
      const emitter = context[contextKey]
      if (emitter) {
        this.state = {
          value: emitter.getInitialValue()
        }
        this.unsubscribe = emitter.subscribe((value) => {
          this.setState({ value })
        })
      } else {
        this.state = {}
      }
    }

    componentWillUnmount() {
      this.unsubscribe()
    }

    render() {
      return this.props.children(this.state.value)
    }

  }
)

export { createContextEmitter, createContextSubscriber }
