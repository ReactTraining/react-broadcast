import React from "react";
import PropTypes from "prop-types";
import warning from "warning";

const valueTypes = {
  string: PropTypes.string,
  number: PropTypes.number,
  function: PropTypes.func,
  boolean: PropTypes.bool
};

// TODO: This could probably be improved.
function getPropType(value) {
  const type = typeof value;

  if (type === "object") {
    return Array.isArray(value) ? PropTypes.array : PropTypes.object;
  }

  return valueTypes[type] || PropTypes.any;
}

// TODO: Swap this out for Symbol once we don't need a shim for it.
let uid = 1;

function createContext(defaultValue) {
  const valueType = getPropType(defaultValue);
  const channel = uid++;

  const provide = (value, children) => {
    return (
      <Provider value={value}>
        {children}
      </Provider>
    );
  };

  const consume = (render) => {
    return (
      <Consumer>
        {render}
      </Consumer>
    );
  };

  /**
   * A <Provider> is a container for a "value" that its <Consumer>
   * may subscribe to.
   */
  class Provider extends React.Component {
    /**
     * For convenience when setting up a component that tracks this
     * <Provider>'s value in state.
     *
     *   const { Provider, Consumer } = createContext("default value")
     *
     *   class MyComponent {
     *     state = {
     *       value: Provider.defaultValue
     *     }
     *
     *     // ...
     *
     *     render() {
     *       return <Provider value={this.state.value}/>
     *     }
     *   }
     */
    static defaultValue = defaultValue;

    static propTypes = {
      children: PropTypes.node,
      value: valueType
    };

    static defaultProps = {
      value: defaultValue
    };

    static contextTypes = {
      broadcasts: PropTypes.object
    };

    static childContextTypes = {
      broadcasts: PropTypes.object.isRequired
    };

    subscribers = [];

    publish = value => {
      this.subscribers.forEach(s => s(value));
    };

    subscribe = subscriber => {
      this.subscribers.push(subscriber);

      return () => {
        this.subscribers = this.subscribers.filter(s => s !== subscriber);
      };
    };

    getChildContext() {
      return {
        broadcasts: {
          ...this.context.broadcasts,
          [channel]: {
            subscribe: this.subscribe,
            value: this.props.value
          }
        }
      };
    }

    componentWillReceiveProps(nextProps) {
      if (this.props.value !== nextProps.value) {
        this.publish(nextProps.value);
      }
    }

    render() {
      return this.props.children;
    }
  }

  /**
   * A <Consumer> sets state whenever its <Provider value> changes
   * and calls its render prop with the result.
   */
  class Consumer extends React.Component {
    static contextTypes = {
      broadcasts: PropTypes.object
    };

    static propTypes = {
      children: PropTypes.func,
      quiet: PropTypes.bool
    };

    static defaultProps = {
      quiet: false
    };

    broadcast = this.context.broadcasts && this.context.broadcasts[channel];

    state = {
      value: this.broadcast ? this.broadcast.value : defaultValue
    };

    componentDidMount() {
      if (this.broadcast) {
        this.unsubscribe = this.broadcast.subscribe(value => {
          this.setState({ value });
        });
      } else {
        warning(
          this.props.quiet,
          "<Consumer> was rendered outside the context of its <Provider>"
        );
      }
    }

    componentWillUnmount() {
      if (this.unsubscribe) this.unsubscribe();
    }

    render() {
      const { children } = this.props;
      return children ? children(this.state.value) : null;
    }
  }

  return {
    provide,
    consume,
    Provider,
    Consumer
  };
}

export default createContext;
