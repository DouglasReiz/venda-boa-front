import { ApiError } from '../ApiClient/Error.js';

export class AuthService {
  #api;

  constructor(api) {
    this.#api = api;
  }

  async login(email, password) {
    const data = await this.#api.request('/login', 'POST', { email, password });
    //console.log('resposta da api:', data);
    if (!data.token) throw new ApiError(data.message ?? 'Credenciais inválidas');
    localStorage.setItem('auth_token', data.token);
  }

  logout() {
    localStorage.removeItem('auth_token');
  }

  isAuthenticated() {
    return !!localStorage.getItem('auth_token');
  }
}