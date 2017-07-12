# react-broadcast [![Travis][build-badge]][build] [![npm package][npm-badge]][npm]

[build-badge]: https://img.shields.io/travis/ReactTraining/react-broadcast/master.svg?style=flat-square
[build]: https://travis-ci.org/ReactTraining/react-broadcast

[npm-badge]: https://img.shields.io/npm/v/react-broadcast.svg?style=flat-square
[npm]: https://www.npmjs.com/package/react-broadcast

[`react-broadcast`](https://www.npmjs.com/package/react-broadcast) provides a reliable way for React components to propagate state changes to their descendants deep in the component hierarchy, bypassing intermediaries who `return false` from [`shouldComponentUpdate`](https://facebook.github.io/react/docs/component-specs.html#updating-shouldcomponentupdate).

It was originally built to solve issues that arose from using [`react-router`](https://www.npmjs.com/package/react-router) together with [`react-redux`](https://www.npmjs.com/package/react-redux). The router needed a safe way to communicate state changes to `<Link>`s deep in the component hierarchy, but `react-redux` relies on `shouldComponentUpdate` for performance. `react-broadcast` allows the router to work seamlessly with Redux and any other component that uses `shouldComponentUpdate`.

**Please note:** As with anything that uses [context](https://facebook.github.io/react/docs/context.html), this library is experimental. It may cease working in some future version of React. For now, it's a practical workaround for the router. If we discover some better way to do things in the future, rest assured we'll do our best to share what we learn.

## Usage

The following is a totally contrived example, but illustrates the basic functionality we're after:

```js
import React from 'react'
import { Broadcast, Subscriber } from 'react-broadcast'

const users = [
  { name: 'Michael Jackson' },
  { name: 'Ryan Florence' }
]

class UpdateBlocker extends React.Component {
  shouldComponentUpdate() {
    // This is how you indicate to React's reconciler that you don't
    // need to be updated. It's a great way to boost performance when
    // you're sure (based on your props and state) that your render
    // output will not change, but it makes it difficult for libraries
    // to communicate changes down the hierarchy that you don't really
    // know anything about.
    return false
  }

  render() {
    // We can get around the blocker using a <Subscriber>
    return (
      <Subscriber channel="currentUser">
        {currentUser => <p>The current user is {currentUser.name}</p>}
      </Subscriber>
    )
  }
}

class App extends React.Component {
  state = {
    currentUser: users[0]
  }

  componentDidMount() {
    // Randomly change the current user every 2 seconds.
    setInterval(() => {
      const index = Math.floor(Math.random() * users.length)
      this.setState({ currentUser: users[index] })
    }, 2000)
  }

  render() {
    return (
      <Broadcast channel="currentUser" value={this.state.currentUser}>
        <UpdateBlocker/>
      </Broadcast>
    )
  }
}
```

You may prefer to wrap these components into channel-specific pairs to avoid typos and other problems with the indirection involved with the channel strings:

```js
// Broadcasts.js
import { Broadcast, Subscriber } from 'react-broadcast'

const CurrentUserChannel = 'currentUser'

export const CurrentUserBroadcast = (props) =>
  <Broadcast {...props} channel={CurrentUserChannel}/>

export const CurrentUserSubscriber = (props) =>
  <Subscriber {...props} channel={CurrentUserChannel}/>

// App.js
import { CurrentUserBroadcast, CurrentUserSubscriber } from './Broadcasts'

<CurrentUserBroadcast value={user}/>
<CurrentUserSubscriber>{user => ...}</CurrentUserSubscriber>
```

That's it! Enjoy :)
