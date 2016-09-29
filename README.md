# React Context Emission

[npm-badge]: https://img.shields.io/npm/v/react-context-emission.svg?style=flat-square
[npm]: https://www.npmjs.com/package/react-context-emission

[`react-context-emission`](https://www.npmjs.com/package/react-context-emission) React context wrapper to safely provide props deeply in the component tree.

## Installation

Using [npm](https://www.npmjs.com/):

    $ npm install --save react-context-emission

Then with a module bundler like [webpack](https://webpack.github.io/), use as you would anything else:

```js
// using an ES6 transpiler, like babel
import { createContextEmitter, createContextSubscriber } from 'react-context-emission'

// not using an ES6 transpiler
const { createContextEmitter, createContextSubscriber } = require('react-context-emission')
```

The UMD build is also available on [npmcdn](https://npmcdn.com):

```html
<script src="https://npmcdn.com/react-context-emission/umd/react-context-emission.min.js"></script>
```

You can find the library on `window.ReactContextEmission`.

## Motivation

Sometimes you have some state in a component you want to make available to any arbitrary descendant in the component tree. Passing props deeply gets cumbersome, recursively cloning is not very exciting, monkey-patching createElement is terrifying, and externalizing that state with another library requires you to bail out of React and decrease the reusability of your component.

:(

Context, however, ~seems~ like a great place to put that state. It's available arbitrarily deep in the tree and maintains React's encapsulated composability and reusability. It would be enough on its own, except that accessing the values on context is not reliable.

Any component in the tree that implements `shouldComponentUpdate` has no way of knowing if the values on context have changed. This means that a `setState` on a context providing component won't always cause a rerender of components deeper in the tree that need that state from context.

So, instead of using context as a place to store values, it can be used to provide a way to subscribe to the values, ensuring deep rerenders when the values change.

This library gives you a way to create components to do the provide/subscribe dance declaratively inside your app, providing state from up high to down low with ease.

## Usage

Let's say you want to listen to the geo location and make that data available anywhere in the app.

```js
import { createContextEmitter, createContextSubscriber } from 'react-context-emission'

const GeoEmitter = createContextEmitter('geo')
const GeoSubscriber = createContextSubscriber('geo')
// the string "geo" is the key used on context

// Here's the component that keeps the device's position in state
class GeoProvider extends React.Component {

  state = {
    geo: null
  }

  componentDidMount() {
    navigator.geolocation.watchPosition((geo) => {
      this.setState({ geo })
    })
  }

  render() {
    return (
      // render the Emitter
      <GeoEmitter geo={this.state.geo}>
        {this.props.children}
      </GeoEmitter>
    )
  }

}

// Now, any arbitrary descendant of GeoProvider can access the geo
// information by rendering a GeoSubscriber, if the geo data changes
// and we're below a `shouldComponentUpdate` we'll still get an update
class SomeDeepComponent extends React.Component {
  render() {
    return (
      <GeoSubscriber>
        {(geo) => geo ? (
          <dl>
            <dt>latitude</dt>
            <dd>{geo.coords.latitude}</dd>
            <dt>longitude</dt>
            <dd>{geo.coords.longitude}</dd>
          </dl>
        ) : (
          <p>Getting geoposition...</p>
        )}
      </GeoSubscriber>
    )
  }
}
```

Some folks would prefer a higher order component that passes the geo props to a wrapped component instead of a render callback, that's pretty quick to implement:

```js
const withGeo = (Component) => (
  (props) => (
    <GeoSubscriber>
      {(geo) => (
        <Component geo={geo} {...props}/>
      )}
    </GeoSubscriber>
  )
)
```
