// Controller/DashboardController.js
export class DashboardController {
    #caixaAdmin;
    #grafico;

    constructor(caixaAdminService, graficoService) {
        this.#caixaAdmin = caixaAdminService;
        this.#grafico = graficoService;
    }

    async init() {
        try {
            await this.#renderCaixas();
            this.#bindBotoesFechamento();
            await this.#renderGrafico();
        } catch (error) {
            console.error("Erro ao inicializar Dashboard:", error);
        }
    }

    async #renderCaixas() {
        const container = document.getElementById('lista-caixas-abertos');
        if (!container) return;

        try {
            const caixas = await this.#caixaAdmin.getCaixasAbertos();

            if (caixas.length === 0) {
                container.innerHTML = '<p style="color: #cbd5e0;">Nenhum caixa aberto no momento.</p>';
                return;
            }

            container.innerHTML = caixas.map(c => `
                <div class="caixa-item" style="display:flex;justify-content:space-between;align-items:center;padding:12px;background:rgba(255,255,255,0.05);margin-bottom:8px;border-radius:8px;">
                    <div>
                        <strong>Caixa #${c.id}</strong><br>
                        <small style="color:#cbd5e0;">Operador: ${c.user?.name ?? 'Não identificado'}</small>
                    </div>
                    <button data-id="${c.id}" class="btn-fechar-admin btn btn-fechar"
                        style="background:#f56565;color:white;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;">
                        Fechar
                    </button>
                </div>
            `).join('');
        } catch {
            container.innerHTML = '<p style="color:#f56565;">Erro ao carregar caixas.</p>';
        }
    }

    #bindBotoesFechamento() {
        document.querySelectorAll('.btn-fechar-admin').forEach(btn => {
            btn.addEventListener('click', e => {
                const id = e.currentTarget.getAttribute('data-id');
                this.#fecharCaixa(id);
            });
        });
    }

    async #fecharCaixa(caixaId) {
        if (!confirm(`Deseja realmente forçar o fechamento do caixa #${caixaId}?`)) return;

        try {
            await this.#caixaAdmin.fecharCaixa(caixaId);
            alert('Caixa fechado com sucesso!');
            this.init();
        } catch (e) {
            alert('Erro ao fechar caixa: ' + e.message);
        }
    }

    async #renderGrafico() {
        const ctx = document.getElementById('graficoVendas');
        if (!ctx) return;

        try {
            const dados = await this.#grafico.getHistoricoFechamentos();
            const lista = Array.isArray(dados) ? dados : [];

            if (window.meuGraficoVendas) window.meuGraficoVendas.destroy();

            window.meuGraficoVendas = new Chart(ctx.getContext('2d'), {
                type: 'line',
                data: {
                    labels: lista.map(i => i.label),
                    datasets: [{
                        label: 'Faturamento por Caixa (R$)',
                        data: lista.map(i => i.valor),
                        borderColor: '#48bb78',
                        backgroundColor: 'rgba(72,187,120,0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { labels: { color: 'white' } } },
                    scales: {
                        x: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: 'white' } },
                        y: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: 'white' } }
                    }
                }
            });
        } catch (error) {
            console.error("Erro ao carregar gráfico:", error);
        }
    }
}