export function dashboardPage() {
    return `
    <div class="page-grid-2">
        <div class="glass-card">
            <h2>Caixas Abertos</h2>
            <div id="lista-caixas-abertos"></div>
        </div>

        <div class="glass-card">
            <h2>Performance de Vendas</h2>
            <canvas id="graficoVendas"></canvas>
        </div>

        <div class="dashboard-actions">
            <button id="btn-logout"      class="btn btn-ghost">Sair</button>
            <button id="btn-ir-checkout" class="btn btn-primary">Ir para Movimentação</button>
        </div>
    </div>
    `;
}