## Usage

```js
import { Broadcast, Subscriber } from 'react-broadcast'

<Broadcast channel="currentUser" value={{ name: 'Michael' }}>
  <div>
    <Subscriber channel="currentUser">
    {currentUser => (
      <p>The current user is {currentUser.name}</p>
    )}
    </Subscriber>
  </div>
</Broadcast>
```
