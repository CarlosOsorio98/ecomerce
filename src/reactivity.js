export class Observable {
    constructor(value) {
        this._value = value;
        this._subscribers = new Set();
    }

    get value() {
        return this._value;
    }

    set value(newValue) {
        if (this._value !== newValue) {
            this._value = newValue;
            this._notify();
        }
    }

    subscribe(subscriber) {
        this._subscribers.add(subscriber);
        // Ejecutar inmediatamente con el valor actual
        subscriber(this._value);
        
        // Retornar función para desuscribirse
        return () => {
            this._subscribers.delete(subscriber);
        };
    }

    _notify() {
        for (const subscriber of this._subscribers) {
            subscriber(this._value);
        }
    }
}

export function createStore(initialState = {}) {
    const state = {};
    const subscribers = new Set();

    // Convertir cada propiedad en Observable
    for (const [key, value] of Object.entries(initialState)) {
        state[key] = new Observable(value);
    }

    return {
        getState() {
            const currentState = {};
            for (const [key, observable] of Object.entries(state)) {
                currentState[key] = observable.value;
            }
            return currentState;
        },

        setState(newState) {
            for (const [key, value] of Object.entries(newState)) {
                if (state[key]) {
                    state[key].value = value;
                } else {
                    state[key] = new Observable(value);
                }
            }
        },

        subscribe(key, callback) {
            if (state[key]) {
                return state[key].subscribe(callback);
            }
            return () => {};
        }
    };
}