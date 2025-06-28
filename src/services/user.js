import { setUser } from '../state.js';

export class UserService {
    constructor() {
        this.USERS_KEY = 'users';
    }

    async updateProfile(userId, updateData) {
        const users = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            throw new Error('Usuario no encontrado');
        }

        // No permitir actualizar email o contraseña desde aquí
        const { email, password, id, ...allowedUpdates } = updateData;

        // Actualizar datos permitidos
        users[userIndex] = {
            ...users[userIndex],
            ...allowedUpdates,
            updatedAt: new Date().toISOString()
        };

        // Guardar cambios
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));

        // Actualizar estado global si es el usuario actual
        const currentUser = JSON.parse(localStorage.getItem('auth_user') || 'null');
        if (currentUser && currentUser.id === userId) {
            const updatedUser = {
                ...currentUser,
                ...allowedUpdates
            };
            localStorage.setItem('auth_user', JSON.stringify(updatedUser));
            setUser(updatedUser);
        }

        return users[userIndex];
    }

    async changePassword(userId, oldPassword, newPassword) {
        const users = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            throw new Error('Usuario no encontrado');
        }

        // Verificar contraseña actual
        if (users[userIndex].password !== oldPassword) {
            throw new Error('Contraseña actual incorrecta');
        }

        // Actualizar contraseña
        users[userIndex].password = newPassword;
        users[userIndex].updatedAt = new Date().toISOString();

        // Guardar cambios
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));

        return { message: 'Contraseña actualizada exitosamente' };
    }

    async deleteAccount(userId, password) {
        const users = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            throw new Error('Usuario no encontrado');
        }

        // Verificar contraseña
        if (users[userIndex].password !== password) {
            throw new Error('Contraseña incorrecta');
        }

        // Eliminar usuario
        users.splice(userIndex, 1);
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));

        // Limpiar sesión si es el usuario actual
        const currentUser = JSON.parse(localStorage.getItem('auth_user') || 'null');
        if (currentUser && currentUser.id === userId) {
            localStorage.removeItem('auth_user');
            setUser(null);
        }

        return { message: 'Cuenta eliminada exitosamente' };
    }
}

// Exportar una instancia única del servicio
export const userService = new UserService();