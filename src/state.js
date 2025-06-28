import { createStore } from './reactivity.js';

// Estado inicial de la aplicación
const initialState = {
    user: null,
    isAuthenticated: false,
    currentRoute: window.location.pathname
};

// Crear store global
export const store = createStore(initialState);

// Getters convenientes
export const getUser = () => store.getState().user;
export const isAuthenticated = () => store.getState().isAuthenticated;
export const getCurrentRoute = () => store.getState().currentRoute;

// Acciones para modificar el estado
export const setUser = (user) => {
    store.setState({
        user,
        isAuthenticated: !!user
    });
};

export const setCurrentRoute = (route) => {
    store.setState({ currentRoute: route });
};

export const logout = () => {
    store.setState({
        user: null,
        isAuthenticated: false
    });
};