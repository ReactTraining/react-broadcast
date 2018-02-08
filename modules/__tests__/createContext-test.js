import React from "react";
import ReactDOM from "react-dom";
import { Simulate } from "react-dom/test-utils";
import createContext from "../createContext";

describe("createContext", () => {
  it("creates a Provider component", () => {
    const { Provider } = createContext();
    expect(typeof Provider).toBe("function");
  });

  it("creates a Consumer component", () => {
    const { Consumer } = createContext();
    expect(typeof Consumer).toBe("function");
  });
});

describe("A <Provider>", () => {
  it("knows its default value", () => {
    const defaultValue = "bubblegum";
    const { Provider } = createContext(defaultValue);
    expect(defaultValue).toEqual(Provider.defaultValue);
  });
});

describe("A <Consumer>", () => {
  let node;
  beforeEach(() => {
    node = document.createElement("div");
  });

  it("gets the initial broadcast value on the initial render", done => {
    const defaultValue = "cupcakes";
    const { Provider, Consumer } = createContext(defaultValue);

    let actualValue;

    ReactDOM.render(
      <Provider>
        <Consumer
          children={value => {
            actualValue = value;
            return null;
          }}
        />
      </Provider>,
      node,
      () => {
        expect(actualValue).toBe(defaultValue);
        done();
      }
    );
  });

  it("gets the updated broadcast value as it changes", done => {
    const { Provider, Consumer } = createContext("cupcakes");

    class Parent extends React.Component {
      state = {
        value: Provider.defaultValue
      };

      render() {
        return (
          <Provider value={this.state.value}>
            <button
              onClick={() => this.setState({ value: "bubblegum" })}
              ref={node => (this.button = node)}
            />
            <Child />
          </Provider>
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
          <Consumer
            children={value => {
              if (childDidRender) {
                expect(value).toBe("bubblegum");
                done();
              } else {
                expect(value).toBe(Provider.defaultValue);
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

  describe("under a <Provider> with a value different from the default", () => {
    it("gets the broadcast value on the initial render", () => {
      const defaultValue = "bubblegum";
      const { Provider, Consumer } = createContext(defaultValue);

      const node = document.createElement("div");

      let actualValue;

      ReactDOM.render(
        <Provider value="cupcakes">
          <Consumer
            children={value => {
              actualValue = value;
              return null;
            }}
          />
        </Provider>,
        node,
        () => {
          expect(actualValue).toEqual("cupcakes");
        }
      );
    });
  });
});

describe("nested <Provider>", () => {
  let node;
  beforeEach(() => {
    node = document.createElement("div");
  });

  it("gets the updated broadcast value as it changes", done => {
    const ParentContext = createContext("cupcakes");
    const ChildContext = createContext();

    class UpdateBlocker extends React.Component {
      shouldComponentUpdate() {
        return false;
      }

      render() {
        return this.props.children;
      }
    }

    class AsyncRender extends React.Component {
      state = {
        shouldRender: false
      };

      componentDidMount() {
        // simulate asynchronous rendering
        setTimeout(() => {
          this.setState({
            shouldRender: true
          });
        });
      }

      render() {
        return this.state.shouldRender && this.props.children;
      }
    }

    class Parent extends React.Component {
      state = {
        value: ParentContext.Provider.defaultValue
      };

      render() {
        return (
          <ParentContext.Provider value={this.state.value}>
            <button
              onClick={() => this.setState({ value: "bubblegum" })}
              ref={node => (this.button = node)}
            />
            <UpdateBlocker>
              <ChildContext.Provider>
                <AsyncRender>
                  <Child />
                </AsyncRender>
              </ChildContext.Provider>
            </UpdateBlocker>
          </ParentContext.Provider>
        );
      }
    }

    class Child extends React.Component {
      render() {
        return (
          <ParentContext.Consumer
            children={value => {
              expect(value).toBe("bubblegum");

              done();

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
});
