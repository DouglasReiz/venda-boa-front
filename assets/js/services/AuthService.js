import { ApiError } from '../ApiClient/Error.js';

export class AuthService {
  #api;

  constructor(api) {
    this.#api = api;
  }

  async login(email, password) {
    const data = await this.#api.request('/login', 'POST', { email, password });
    if (!data.token) throw new ApiError(data.message ?? 'Credenciais inválidas');

    localStorage.setItem('auth_token', data.token);

    // Busca os dados do usuário logo após o login usando a rota /user
    const user = await this.#api.get('/user');
    localStorage.setItem('auth_user', JSON.stringify(user));
  }

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  isAuthenticated() {
    return !!localStorage.getItem('auth_token');
  }

  getUser() {
    try {
      return JSON.parse(localStorage.getItem('auth_user'));
    } catch {
      return null;
    }
  }

  getName() {
    return this.getUser()?.name ?? 'Usuário';
  }
}