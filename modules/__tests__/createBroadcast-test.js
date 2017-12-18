import React from "react"
import ReactDOM from "react-dom"
import { Simulate } from "react-dom/test-utils"
import createBroadcast from "../createBroadcast"

describe("createBroadcast", () => {
  it("creates a Broadcast component", () => {
    const { Broadcast } = createBroadcast()
    expect(typeof Broadcast).toBe("function")
  })

  it("creates a Subscriber component", () => {
    const { Subscriber } = createBroadcast()
    expect(typeof Subscriber).toBe("function")
  })
})

describe("A <Subscriber>", () => {
  let node
  beforeEach(() => {
    node = document.createElement("div")
  })

  it("gets the initial broadcast value on the initial render", done => {
    const initialValue = "cupcakes"
    const { Subscriber } = createBroadcast(initialValue)

    let actualValue

    ReactDOM.render(
      <Subscriber
        children={value => {
          actualValue = value
          return null
        }}
      />,
      node,
      () => {
        expect(actualValue).toBe(initialValue)
        done()
      }
    )
  })

  it("gets the updated broadcast value as it changes", done => {
    const { Broadcast, Subscriber } = createBroadcast("cupcakes")

    class Parent extends React.Component {
      state = {
        value: Broadcast.initialValue
      }

      render() {
        return (
          <Broadcast value={this.state.value}>
            <button
              onClick={() => this.setState({ value: "bubblegum" })}
              ref={node => (this.button = node)}
            />
            <Child />
          </Broadcast>
        )
      }
    }

    let childDidRender = false

    class Child extends React.Component {
      // Make sure we can bypass a sCU=false!
      shouldComponentUpdate() {
        return false
      }

      render() {
        return (
          <Subscriber
            children={value => {
              if (childDidRender) {
                expect(value).toBe("bubblegum")
                done()
              } else {
                expect(value).toBe(Broadcast.initialValue)
              }

              childDidRender = true

              return null
            }}
          />
        )
      }
    }

    ReactDOM.render(<Parent />, node, function() {
      Simulate.click(this.button)
    })
  })
})
