export default (initialState) => {
  let listeners = []
  let currentState = initialState

  const getState = () =>
    currentState

  const setState = (state) => {
    currentState = state
    listeners.forEach(listener => listener(currentState))
  }

  const subscribe = (listener) => {
    listeners.push(listener)

    return () =>
      listeners = listeners.filter(item => item !== listener)
  }

  return {
    getState,
    setState,
    subscribe
  }
}