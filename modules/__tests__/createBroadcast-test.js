import React from "react";
import ReactDOM from "react-dom";
import { Simulate } from "react-dom/test-utils";
import createBroadcast from "../createBroadcast";

describe("createBroadcast", () => {
  it("creates a Broadcast component", () => {
    const { Broadcast } = createBroadcast();
    expect(typeof Broadcast).toBe("function");
  });

  it("creates a Subscriber component", () => {
    const { Subscriber } = createBroadcast();
    expect(typeof Subscriber).toBe("function");
  });
});

describe("A <Broadcast>", () => {
  it("knows its default value", () => {
    const defaultValue = "bubblegum";
    const { Broadcast } = createBroadcast(defaultValue);
    expect(defaultValue).toEqual(Broadcast.defaultValue);
  });
});

describe("A <Subscriber>", () => {
  let node;
  beforeEach(() => {
    node = document.createElement("div");
  });

  it("gets the initial broadcast value on the initial render", done => {
    const defaultValue = "cupcakes";
    const { Broadcast, Subscriber } = createBroadcast(defaultValue);

    let actualValue;

    ReactDOM.render(
      <Broadcast>
        <Subscriber
          children={value => {
            actualValue = value;
            return null;
          }}
        />
      </Broadcast>,
      node,
      () => {
        expect(actualValue).toBe(defaultValue);
        done();
      }
    );
  });

  it("gets the updated broadcast value as it changes", done => {
    const { Broadcast, Subscriber } = createBroadcast("cupcakes");

    class Parent extends React.Component {
      state = {
        value: Broadcast.defaultValue
      };

      render() {
        return (
          <Broadcast value={this.state.value}>
            <button
              onClick={() => this.setState({ value: "bubblegum" })}
              ref={node => (this.button = node)}
            />
            <Child />
          </Broadcast>
        );
      }
    }

    let childDidRender = false;

    class Child extends React.Component {
      // Make sure we can bypass sCU=false!
      shouldComponentUpdate() {
        return false;
      }

      render() {
        return (
          <Subscriber
            children={value => {
              if (childDidRender) {
                expect(value).toBe("bubblegum");
                done();
              } else {
                expect(value).toBe(Broadcast.defaultValue);
              }

              childDidRender = true;

              return null;
            }}
          />
        );
      }
    }

    ReactDOM.render(<Parent />, node, function() {
      Simulate.click(this.button);
    });
  });

  describe("under a <Broadcast> with a value different from the default", () => {
    it("gets the broadcast value on the initial render", () => {
      const defaultValue = "bubblegum";
      const { Broadcast, Subscriber } = createBroadcast(defaultValue);

      const node = document.createElement("div");

      let actualValue;

      ReactDOM.render(
        <Broadcast value="cupcakes">
          <Subscriber
            children={value => {
              actualValue = value;
              return null;
            }}
          />
        </Broadcast>,
        node,
        () => {
          expect(actualValue).toEqual("cupcakes");
        }
      );
    });
  });
});
