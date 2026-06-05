export function loginPage() {
    return `
    <div class="page-centered">
        <div class="card">
            <h1>VendaBoa</h1>
            <input type="email"     id="email"    placeholder="E-mail">
            <input type="password"  id="password" placeholder="Senha">
            <button id="btn-login" class="btn btn-primary">Entrar</button>
        </div>
    </div>
    `;
}