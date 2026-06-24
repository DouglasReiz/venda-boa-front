import { BaseController } from './BaseController.js';

export class DashboardController extends BaseController {
    #caixaAdmin;
    #grafico;

    constructor(auth, caixaAdminService, graficoService) {
        super(auth);
        this.#caixaAdmin = caixaAdminService;
        this.#grafico    = graficoService;
    }

    async init() {
        this.montarNavbar();

        // Binds de navegação primeiro — não dependem de API
        this.#bindNavegacao();

        // Carregamentos assíncronos em paralelo — erro em um não bloqueia o outro
        await Promise.allSettled([
            this.#renderCaixas().then(() => this.#bindBotoesFechamento()),
            this.#renderGrafico(),
        ]);
    }

    #bindNavegacao() {
        const binds = [
            { id: 'btn-ir-checkout',       rota: '/checkout/abrir'    }, // abre caixa → redireciona para /pdv
            { id: 'btn-ir-pdv',            rota: '/checkout/abrir'    },
            { id: 'btn-ir-admin-produtos', rota: '/admin/produtos'    },
            { id: 'btn-ir-estoque',        rota: '/estoque'           },
            { id: 'btn-ir-usuarios',       rota: '/usuarios'          },
        ];

        binds.forEach(({ id, rota }) => {
            document.getElementById(id)
                ?.addEventListener('click', () => window.router.navigate(rota));
        });
    }

    async #renderCaixas() {
        const container = document.getElementById('lista-caixas-abertos');
        if (!container) return;

        try {
            const caixas = await this.#caixaAdmin.getCaixasAbertos();

            if (caixas.length === 0) {
                container.innerHTML = '<p style="color: rgba(255,255,255,0.4);">Nenhum caixa aberto no momento.</p>';
                return;
            }

            container.innerHTML = caixas.map(c => `
                <div class="caixa-item">
                    <div>
                        <strong>Caixa #${c.id}</strong><br>
                        <small style="color:rgba(255,255,255,0.5);">
                            Operador: ${c.user?.name ?? 'Não identificado'}
                        </small>
                    </div>
                    <button data-id="${c.id}" class="btn-fechar-admin btn btn-fechar"
                        style="width:auto;padding:6px 14px;font-size:13px;">
                        Fechar
                    </button>
                </div>
            `).join('');
        } catch {
            container.innerHTML = '<p style="color: var(--color-danger);">Erro ao carregar caixas.</p>';
        }
    }

    #bindBotoesFechamento() {
        document.querySelectorAll('.btn-fechar-admin').forEach(btn => {
            btn.addEventListener('click', e => {
                const id = e.currentTarget.getAttribute('data-id');
                this.#fecharCaixaAdmin(id);
            });
        });
    }

    async #fecharCaixaAdmin(caixaId) {
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
            const dados  = await this.#grafico.getHistoricoFechamentos();
            const lista  = Array.isArray(dados) ? dados : [];

            if (window.meuGraficoVendas) window.meuGraficoVendas.destroy();

            window.meuGraficoVendas = new Chart(ctx.getContext('2d'), {
                type: 'line',
                data: {
                    labels:   lista.map(i => i.label),
                    datasets: [{
                        label:           'Faturamento por Caixa (R$)',
                        data:            lista.map(i => i.valor),
                        borderColor:     '#48bb78',
                        backgroundColor: 'rgba(72,187,120,0.1)',
                        tension:         0.4,
                        fill:            true,
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { labels: { color: 'white' } } },
                    scales: {
                        x: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: 'white' } },
                        y: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: 'white' } },
                    }
                }
            });
        } catch (error) {
            console.error('Erro ao carregar gráfico:', error);
        }
    }
}