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

  it("provides a provide function", () => {
    const { provide } = createContext();
    expect(typeof provide).toBe("function");
  });

  it("provides a consume function", () => {
    const { consume } = createContext();
    expect(typeof consume).toBe("function");
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

describe("provide", () => {
  it("places the expected value on the context", () => {
    let node = document.createElement("div");
    
    const defaultValue = "licorice";
    let actualValue;
    let providedValue = "taffy";

    const { provide, Consumer } = createContext(defaultValue);
    const SweetsProvider = ({ value, children }) => (
      provide(value, children)
    );
    
    ReactDOM.render((
      <SweetsProvider value={providedValue}>
        <Consumer>
          {value => {
            actualValue = value;
            return null;
          }}
        </Consumer>
      </SweetsProvider>
    ), node, () => {
      expect(actualValue).toBe(providedValue);
    });
  });
});

describe("consume", () => {
  it("is called with the correct value", () => {
    let node = document.createElement("div");

    const defaultValue = "chocolate";
    let actualValue;
    let providedValue = "popsicle";

    const { Provider, consume } = createContext(defaultValue);

    const SweetTooth = () => (
      consume(value => {
        actualValue = value;
        return null;
      })
    );

    ReactDOM.render((
      <Provider value={providedValue}>
        <SweetTooth />
      </Provider>
    ), node, () => {
      expect(actualValue).toBe(providedValue);
    });
  });
});
