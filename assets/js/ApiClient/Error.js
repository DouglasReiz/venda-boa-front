export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export class UnauthorizedError extends ApiError {
  constructor() {
    super('Sessão expirada ou inválida.', 401);
    this.name = 'UnauthorizedError';
  }
}