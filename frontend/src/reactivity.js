export function createObservable(initialValue) {
  let _value = initialValue
  const _subscribers = new Set()

  const _deepEqual = (a, b) => {
    if (a === b) return true
    if (a == null || b == null) return false
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false
      for (let i = 0; i < a.length; i++) {
        if (!_deepEqual(a[i], b[i])) return false
      }
      return true
    }
    if (typeof a === 'object' && typeof b === 'object') {
      const keysA = Object.keys(a)
      const keysB = Object.keys(b)
      if (keysA.length !== keysB.length) return false
      for (const key of keysA) {
        if (!keysB.includes(key)) return false
        if (!_deepEqual(a[key], b[key])) return false
      }
      return true
    }
    return false
  }

  const _notify = () => {
    for (const subscriber of _subscribers) {
      subscriber(_value)
    }
  }

  const subscribe = (subscriber) => {
    _subscribers.add(subscriber)
    subscriber(_value)
    return () => {
      _subscribers.delete(subscriber)
    }
  }

  const getValue = () => _value

  const setValue = (newValue) => {
    if (!_deepEqual(_value, newValue)) {
      _value = newValue
      _notify()
    }
  }

  return {
    get value() {
      return getValue()
    },
    set value(newValue) {
      setValue(newValue)
    },
    subscribe,
    getValue,
    setValue,
  }
}

export function createStore(initialState = {}) {
  const state = {}

  for (const [key, value] of Object.entries(initialState)) {
    state[key] = createObservable(value)
  }

  return {
    getState() {
      const currentState = {}
      for (const [key, observable] of Object.entries(state)) {
        currentState[key] = observable.value
      }
      return currentState
    },

    setState(newState) {
      for (const [key, value] of Object.entries(newState)) {
        if (state[key]) {
          state[key].value = value
        } else {
          state[key] = createObservable(value)
        }
      }
    },

    subscribe(key, callback) {
      if (state[key]) {
        return state[key].subscribe(callback)
      }
      return () => {}
    },
  }
}
