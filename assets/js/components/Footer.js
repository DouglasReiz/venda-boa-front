/**
 * Footer — componente reutilizável
 *
 * Renderiza uma barra inferior fixa com o nome do usuário e um dropdown
 * que exibe o botão de logout. Funciona em todas as telas protegidas.
 *
 * Uso:
 *   import { renderFooter } from '../components/Footer.js';
 *   renderFooter();
 *
 * Chame após o HTML da página ser injetado no DOM.
 */
export function renderFooter() {
    const footer = document.createElement('footer');
    footer.innerHTML = `
        <p>VendaBoa • Soluções em Gestão de Vendas</p>
        <p>Desenvolvido por Douglas Alves</p>
        <p>Contato: [EMAIL_ADDRESS]</p>
    `;

    document.body.appendChild(footer);
}
