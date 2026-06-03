export function dashboardPage() {
  return `
    <div class="dashboard-container">
      <div class="glass-card">
        <h2>Caixas Abertos no Momento</h2>
        <div id="lista-caixas-abertos" class="caixas-list"></div>
      </div>

      <div class="glass-card">
        <h2>Performance de Vendas</h2>
        <canvas id="graficoVendas"></canvas>
      </div>
    </div>
  `;
}