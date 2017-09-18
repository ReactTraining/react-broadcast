declare module "react-broadcast" {
  import { ComponentClass } from "react"

  namespace ReactBroadcast {
    interface BroadcastProps {
      channel: string,
      value?: any
    }

    interface SubscriberProps {
      channel: string
    }

    const Broadcast: ComponentClass<BroadcastProps>
    const Subscriber: ComponentClass<SubscriberProps>
  }

  export = ReactBroadcast
}
