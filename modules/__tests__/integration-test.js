/*eslint react/prop-types: 0*/
import React from 'react'
import ReactDOM from 'react-dom'
import { EventEmitter } from 'events'
import { Broadcast, Subscriber } from '../index'

it('works', (done) => {
  const steps = []
  const execNextStep = () => steps.shift()()
  const div = document.createElement('div')

  // so we can trigger rerenders in ComponentWithStateForDescendants
  const emitter = new EventEmitter()

  // A component has some state it wants to make available to descendants
  // 1. We create our Broadcast and Subscriber components
  const CheeseBroadcast = ({ cheese, children }) =>
    <Broadcast channel="cheese" value={cheese} children={children}/>

  const CheeseSubscriber = ({ children }) =>
    <Subscriber channel="cheese" children={children}/>

  class ComponentWithStateForDescendants extends React.Component {
    constructor() {
      super()
      this.state = { cheese: 'cheddar' }
      emitter.on('CHEESE', (cheese) => {
        this.setState({ cheese })
      })
    }

    componentDidMount = execNextStep

    componentDidUpdate = execNextStep

    render() {
      // 2. render the Broadcast in the component w/ state and pass
      //    it the value we want accessible through context as a prop
      //    by the same name as when the Broadcast was created
      return (
        <CheeseBroadcast cheese={this.state.cheese}>
          {this.props.children}
        </CheeseBroadcast>
      )
    }
  }

  let actualCheese = null

  steps.push(
    () => {
      expect(actualCheese).toBe('cheddar')
      emitter.emit('CHEESE', 'gouda')
    },
    () => {
      expect(actualCheese).toBe('gouda')
      done()
    }
  )

  // 3. Render a <Subscriber> that calls back when the Broadcast
  //    gets a new value in its prop
  ReactDOM.render((
    <ComponentWithStateForDescendants>
      <CheeseSubscriber>
        {(cheese) => {
          actualCheese = cheese
          return null
        }}
      </CheeseSubscriber>
    </ComponentWithStateForDescendants>
  ), div)
})
