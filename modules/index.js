import React, { PropTypes } from 'react'

const capitalize = (str) =>
  str.charAt(0).toUpperCase() + str.slice(1)

const createContextEmission = (contextKey) => {
  const capitalized = capitalize(contextKey)
  const emitterName = `${capitalized}Emitter`
  const subscriberName = `${capitalized}Subscriber`

  class Emitter extends React.Component {

    static displayName = emitterName

    static propTypes = {
      children: PropTypes.node
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
            return this.props[contextKey]
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
      this.subscribers.forEach(f => f(nextProps[contextKey]))
    }

    render() {
      return this.props.children
    }

  }

  class Subscriber extends React.Component {

    static displayName = subscriberName

    static propTypes = {
      children: PropTypes.func
    }

    static contextTypes = {
      [contextKey]: PropTypes.object
    }

    constructor(props, context) {
      super()
      const emitter = context[contextKey]
      this.state = {
        [contextKey]: emitter.getInitialValue()
      }
      this.unsubscribe = emitter.subscribe((value) => {
        this.setState({
          [contextKey]: value
        })
      })
    }

    componentWillUnmount() {
      this.unsubscribe()
    }

    render() {
      return this.props.children(this.state)
    }

  }

  return {
    [emitterName]: Emitter,
    [subscriberName]: Subscriber
  }
}

export default createContextEmission
