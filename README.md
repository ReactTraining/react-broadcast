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
import createContextEmission from 'react-context-emission'

// not using an ES6 transpiler
var createContextEmission = require('react-context-emission').default
```

The UMD build is also available on [npmcdn](https://npmcdn.com):

```html
<script src="https://npmcdn.com/react-context-emission/umd/react-context-emission.min.js"></script>
```

You can find the library on `window.ReactContextEmission`.

## Motivation

Sometimes you have some state in a component you want to make available
to any arbitrary descendant in the component tree. Passing props deeply
gets cumbersome, recursively cloning is not very exciting,
monkey-patching createElement is terrifying, and externalizing that
state with another library requires you to bail out of React and
decrease the reusability of your component.

:(

Context, however, ~seems~ like a great place to put that state. It's
available arbitrarily deep in the tree and maintains React's
encapsulated composability and reusability. It would be enough on its
own, except that accessing the values on context is not reliable.

Any component in the tree that implements `shouldComponentUpdate` has no
way of knowing if the values on context have changed. This means that a
`setState` on a context providing component won't always cause a
rerender of components deeper in the tree that need that state from
context.

So, instead of using context as a place to store values, it can be used
to provide a way to subscribe to the values, ensuring deep rerenders
when the values change.

This library gives you a way to create components to do the
provide/subscribe dance declaratively inside your app, providing state
from up high to down low with ease.

## Usage

Let's say you want to listen to listen to the geo location and make that
data available anywhere in the app.

```js
import createContextEmission from 'react-context-emission'

const { CoordsEmitter, CoordsSubscriber } = createContextEmission('coords')
// the string "coords" is important, it gets capitalized and used as the
// returned component's names and will be used as the prop name later

// Here's the component that keeps the device's position in state
class CoordsProvider extends React.Component {

  state = {
    coords: null
  }

  componentDidMount() {
    navigator.geolocation.watchPosition((coords) => {
      this.setState({ coords })
    })
  }

  render() {
    return (
      // render the Emitter
      <CoordsEmitter coords={this.state.coords}>
        {this.props.children}
      </CoordsEmitter>
    )
  }

}

// Now, any arbitrary descendant of CoordsProvider can access the coords by
// rendering a CoordsSubscriber, if the coords change and we're below a
// `shouldComponentUpdate` we'll still get an update down here.
class SomeDeepComponent extends React.Component {
  render() {
    return (
      <CoordsSubscriber>
        {({ coords }) => (
          <pre>{JSON.stringify(coords, null, 2)}</pre>
        )}
      </CoordsSubscriber>
    )
  }
}
```

The string you pass to `createContextEmission(string)` is important.

1. It determines the name of the components returned.
- It is the name of the prop you pass to the `Subscriber`
- It is the name of the key passed to the render callback of
  `Subscriber`
- It is used as the context key
- It is used as the state key in the `Emitter`

For example:

string | Emitter | Subscriber
-------|-----------------|-----------
`'coords'` | `<CoordsEmitter coords={val}>` | `<CoordsSubscriber>{({ coords }) => ()}</CoordsSubscriber>`
`'foo'` | `<FooEmitter foo={val}>` | `<FooSubscriber>{({ foo }) => ()}</FooSubscriber>`

