/*eslint-env mocha*/
/*eslint react/prop-types: 0*/
import React from 'react'
import { render } from 'react-dom'
import expect from 'expect'
import { EventEmitter } from 'events'
import { Subscriber, Broadcast } from '../index'
import createSubscriber from '../createSubscriber'

it('works', (done) => {

  const steps = []
  const execNextStep = () => steps.shift()()
  const div = document.createElement('div')

  // so we can trigger rerenders in ComponentWithStateForDescendants
  const emitter = new EventEmitter()

  // A component has some state it wants to make available to descendants
  // 1. We create our Emitter and Subscriber components
  const CheeseEmitter = ({ cheese, children }) =>
    <Broadcast channel="cheese" value={cheese} children={children}/>
  const CheeseSubscriber = ({ children }) =>
    <Subscriber channel="cheese">{(value) => children(value)}</Subscriber>

  const ConnectCheese = ({ cheese }) => {
    actualCheeseConnect = cheese
     return (<div></div>)
   }
  const ConnectCheeseSubscriber = createSubscriber("cheese")(ConnectCheese)


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
        <CheeseEmitter cheese={this.state.cheese}>
          {this.props.children}
        </CheeseEmitter>
      )
    }
  }

  let actualCheese = null
  let actualCheeseConnect = null

  steps.push(
    () => {
      expect(actualCheese).toBe('cheddar')
      expect(actualCheeseConnect).toBe('cheddar')
      emitter.emit('CHEESE', 'gouda')
    },
    () => {
      expect(actualCheese).toBe('gouda')
      expect(actualCheeseConnect).toBe('gouda')
      done()
    }
  )

  // 3. Render a <Subscriber> that calls back when the Emitter
  //    gets a new value in its prop
  render((
    <ComponentWithStateForDescendants>
      <div>
        <CheeseSubscriber>
          {(cheese) => {
            actualCheese = cheese
            return null
          }}
        </CheeseSubscriber>
        <ConnectCheeseSubscriber>
        </ConnectCheeseSubscriber>
      </div>
    </ComponentWithStateForDescendants>
  ), div)
})
