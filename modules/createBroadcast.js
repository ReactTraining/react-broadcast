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

function createBroadcast(defaultValue) {
  const valueType = getPropType(defaultValue);
  const channel = Symbol();

  /**
   * A <Broadcast> is a container for a "value" that its <Subscriber>
   * may subscribe to.
   */
  class Broadcast extends React.Component {
    /**
     * For convenience when setting up a component that tracks this
     * <Broadcast>'s value in state.
     *
     *     const {
     *       Broadcast,
     *       Subscriber
     *     } = createBroadcast("default value")
     *
     *     class MyComponent {
     *       state = {
     *         broadcastValue: Broadcast.defaultValue
     *       }
     *
     *       // ...
     *
     *       render() {
     *         return <Broadcast value={this.state.broadcastValue}/>
     *       }
     *     }
     */
    static defaultValue = defaultValue;

    static propTypes = {
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
            initialValue: this.props.value,
            subscribe: this.subscribe
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
   * A <Subscriber> sets state whenever its <Broadcast value> changes
   * and calls its render prop with the result.
   */
  class Subscriber extends React.Component {
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
      value: this.broadcast ? this.broadcast.initialValue : defaultValue
    };

    componentDidMount() {
      if (this.broadcast) {
        this.unsubscribe = this.broadcast.subscribe(value => {
          this.setState({ value });
        });
      } else {
        warning(
          this.props.quiet,
          "<Subscriber> was rendered outside the context of its <Broadcast>"
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
    Broadcast,
    Subscriber
  };
}

export default createBroadcast;
