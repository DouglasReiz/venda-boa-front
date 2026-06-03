export function loginPage() {
  return `
    <div class="container">
      <div class="card">
        <h1>Login VendaBoa</h1>
        <input type="email" id="email" placeholder="E-mail">
        <input type="password" id="password" placeholder="Senha">
        <button id="btn-login">Entrar</button>
      </div>
    </div>
  `;
}