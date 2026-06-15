import { BaseController } from './BaseController.js';
import { renderBackButton } from '../components/BackButton.js';

/**
 * StockController (frontend)
 *
 * SRP: gerencia a tela de controle de estoque.
 * Responsabilidades:
 *  - Exibir alertas de estoque baixo
 *  - Listar todos os produtos/variantes com quantidade atual
 *  - Permitir ajuste manual de estoque
 *  - Permitir atualização do estoque mínimo
 */
export class StockController extends BaseController {
    #products;
    #visaoGeral = [];

    constructor(auth, productService) {
        super(auth);
        this.#products = productService;
    }

    async init() {
        this.montarNavbar();
        renderBackButton('Voltar ao Dashboard');
        await Promise.all([
            this.#carregarAlertas(),
            this.#carregarVisaoGeral(),
        ]);
    }

    // ── Alertas ───────────────────────────────────────────────────────────────

    async #carregarAlertas() {
        try {
            const alertas = await this.#products.getAlertas();
            const bar = document.getElementById('stock-alerts-bar');
            const texto = document.getElementById('stock-alerts-text');
            if (!bar || !texto) return;

            if (alertas.length === 0) return;

            const zerados = alertas.filter(a => a.zerado).length;
            const baixos = alertas.length - zerados;

            texto.innerHTML = [
                zerados > 0 ? `<strong>${zerados}</strong> produto(s) sem estoque` : '',
                baixos > 0 ? `<strong>${baixos}</strong> produto(s) com estoque baixo` : '',
            ].filter(Boolean).join(' • ');

            bar.style.display = 'flex';
        } catch (e) {
            console.error('Erro ao carregar alertas:', e);
        }
    }

    // ── Visão geral ───────────────────────────────────────────────────────────

    async #carregarVisaoGeral() {
        const container = document.getElementById('stock-list');
        if (!container) return;

        try {
            this.#visaoGeral = await this.#products.getVisaoGeral();

            if (this.#visaoGeral.length === 0) {
                container.innerHTML = '<p class="admin-list-empty">Nenhum produto cadastrado.</p>';
                return;
            }

            container.innerHTML = this.#visaoGeral.map(produto => `
                <div class="stock-product">
                    <div class="stock-product-header">
                        <span class="stock-product-name">${produto.nome}</span>
                        <span class="stock-product-cat">${produto.categoria}</span>
                    </div>
                    <div class="stock-variants">
                        ${produto.variantes.map(v => `
                            <div class="stock-variant-row ${v.zerado ? 'zerado' : v.alerta ? 'alerta' : ''}">
                                <div class="stock-variant-info">
                                    <span class="stock-variant-nome">
                                        ${v.nome}
                                        ${v.zerado ? '<span class="stock-badge zerado">Sem estoque</span>' : ''}
                                        ${!v.zerado && v.alerta ? '<span class="stock-badge alerta">Estoque baixo</span>' : ''}
                                    </span>
                                    <span class="stock-variant-qty">
                                        <strong>${v.estoque}</strong> unidades
                                        <small>mín: ${v.estoque_minimo}</small>
                                    </span>
                                </div>
                                <div class="stock-variant-actions">
                                    <button class="btn btn-primary btn-sm"
                                            data-action="repor"
                                            data-id="${v.id}"
                                            data-nome="${produto.nome} — ${v.nome}">
                                        + Repor
                                    </button>
                                    <button class="btn btn-ghost btn-sm"
                                            data-action="ajustar"
                                            data-id="${v.id}"
                                            data-nome="${produto.nome} — ${v.nome}">
                                        Ajustar
                                    </button>
                                    <button class="btn btn-neutral btn-sm"
                                            data-action="minimo"
                                            data-id="${v.id}"
                                            data-minimo="${v.estoque_minimo}"
                                            data-nome="${produto.nome} — ${v.nome}">
                                        Mínimo: ${v.estoque_minimo}
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('');

            // Delegação de eventos
            container.onclick = (e) => {
                const btn = e.target.closest('[data-action]');
                if (!btn) return;
                const { action, id, nome, minimo } = btn.dataset;

                if (action === 'repor') this.#modalRepor(id, nome);
                if (action === 'ajustar') this.#modalAjustar(id, nome);
                if (action === 'minimo') this.#modalMinimo(id, nome, minimo);
            };
        } catch (e) {
            container.innerHTML = '<p class="admin-list-empty">Erro ao carregar estoque.</p>';
        }
    }

    // ── Modais de ação ────────────────────────────────────────────────────────

    async #modalRepor(variantId, nome) {
        const qty = prompt(`Quantas unidades deseja adicionar ao estoque de:\n"${nome}"?`);
        if (!qty || isNaN(qty) || parseInt(qty) <= 0) return;

        try {
            const res = await this.#products.ajustarEstoque(variantId, {
                quantidade: parseInt(qty),
                motivo: 'Reposição manual',
            });
            alert(`Estoque atualizado! Novo saldo: ${res.estoque} unidades.`);
            await this.#carregarVisaoGeral();
            await this.#carregarAlertas();
        } catch (e) {
            alert('Erro: ' + e.message);
        }
    }

    async #modalAjustar(variantId, nome) {
        const qty = prompt(
            `Ajuste de estoque para:\n"${nome}"\n\n` +
            `Digite um valor positivo para adicionar ou negativo para remover.\n` +
            `Exemplo: 5 (adiciona) ou -3 (remove)`
        );
        if (qty === null || qty === '' || isNaN(qty) || parseInt(qty) === 0) return;

        const motivo = prompt('Motivo do ajuste (opcional):') || 'Ajuste manual';

        try {
            const res = await this.#products.ajustarEstoque(variantId, {
                quantidade: parseInt(qty),
                motivo,
            });
            alert(`Estoque ajustado! Novo saldo: ${res.estoque} unidades.`);
            await this.#carregarVisaoGeral();
            await this.#carregarAlertas();
        } catch (e) {
            alert('Erro: ' + e.message);
        }
    }

    async #modalMinimo(variantId, nome, minimoAtual) {
        const novoMinimo = prompt(
            `Estoque mínimo para:\n"${nome}"\n\nValor atual: ${minimoAtual}\nNovo valor:`,
            minimoAtual
        );
        if (novoMinimo === null || isNaN(novoMinimo) || parseInt(novoMinimo) < 0) return;

        try {
            await this.#products.atualizarMinimo(variantId, {
                estoque_minimo: parseInt(novoMinimo),
            });
            alert('Estoque mínimo atualizado!');
            await this.#carregarVisaoGeral();
            await this.#carregarAlertas();
        } catch (e) {
            alert('Erro: ' + e.message);
        }
    }
}