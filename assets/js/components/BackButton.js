/**
 * renderBackButton
 *
 * Injeta um botão "← Voltar" no topo da página (abaixo da navbar).
 * Usa window.router.back() — volta para a rota anterior ou /dashboard.
 *
 * @param {string} [label] — texto opcional (padrão: "Voltar")
 */
export function renderBackButton(label = 'Voltar') {
    document.getElementById('app-back-btn')?.remove();

    const wrapper = document.createElement('div');
    wrapper.id        = 'app-back-btn';
    wrapper.innerHTML = `
        <button class="back-btn" id="btn-voltar">
            <svg viewBox="0 0 20 20" fill="none">
                <path d="M12 16l-6-6 6-6"
                      stroke="currentColor" stroke-width="1.8"
                      stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            ${label}
        </button>
    `;

    // Posiciona logo abaixo da navbar, antes do #app
    const app = document.getElementById('app');
    document.body.insertBefore(wrapper, app);

    document.getElementById('btn-voltar').addEventListener('click', () => {
        window.router.back();
    });
}