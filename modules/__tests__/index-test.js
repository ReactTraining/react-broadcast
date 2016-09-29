import React from 'react'
import { render } from 'react-dom'
import expect from 'expect'
import { EventEmitter } from 'events'
import { createContextEmitter, createContextSubscriber } from '../index'

it('works', (done) => {

  const steps = []
  const execNextStep = () => steps.shift()()
  const div = document.createElement('div')

  // so we can trigger rerenders in ComponentWithStateForDescendants
  const emitter = new EventEmitter()

  // A component has some state it wants to make available to descendants
  // 1. We create our Emitter and Subscriber components
  const CheeseEmitter = createContextEmitter('cheese')
  const CheeseSubscriber = createContextSubscriber('cheese')

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
      // 2. render the Emitter in the component w/ state and pass
      //    it the value we want accessible through context as a prop
      //    by the same name as when the Emitter was created
      return (
        <CheeseEmitter value={this.state.cheese}>
          {this.props.children}
        </CheeseEmitter>
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

  // 3. Render a <Subscriber> that calls back when the Emitter
  //    gets a new value in its prop
  render((
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
