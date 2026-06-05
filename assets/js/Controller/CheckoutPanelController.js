import { BaseController } from './BaseController.js';

/**
 * CheckoutPanelController
 *
 * SRP: gerencia apenas o painel de movimentações do turno ativo.
 *
 * Dois fluxos de saída distintos:
 *  - "Fechar Caixa"    → /checkout/fechar   (encerra o turno do operador)
 *  - "Finalizar Venda" → /checkout/pagamento (processa uma venda e volta para nova venda)
 */
export class CheckoutPanelController extends BaseController {
    #checkout;

    constructor(auth, checkout) {
        super(auth);
        this.#checkout = checkout;
    }

    async bindCheckoutOperations() {
        this.montarNavbar();
        this.#bindBotoes();
        await this.#carregarHistorico();
    }

    // ── Privados ──────────────────────────────────────────────────────────────

    #bindBotoes() {
        const btnFecharCaixa    = document.getElementById('btn-fechar-caixa');
        const btnFinalizarVenda = document.getElementById('btn-ir-finalizar');
        const btnEntrada        = document.getElementById('btn-entrada');
        const btnSaida          = document.getElementById('btn-saida');

        // Encerra o turno — vai para a tela de resumo/fechamento
        if (btnFecharCaixa) {
            btnFecharCaixa.addEventListener('click', () => {
                window.router.navigate('/checkout/fechar');
            });
        }

        // Finaliza uma venda — calcula total, salva no serviço e vai para pagamento
        if (btnFinalizarVenda) {
            btnFinalizarVenda.addEventListener('click', () => {
                const total = this.#checkout.calcularTotal();
                this.#checkout.setValorVenda(total);
                window.router.navigate('/checkout/pagamento');
            });
        }

        if (btnEntrada) {
            btnEntrada.addEventListener('click', async () => {
                await this.#registrarMovimentacao('entrada');
            });
        }

        if (btnSaida) {
            btnSaida.addEventListener('click', async () => {
                await this.#registrarMovimentacao('saida');
            });
        }

    }

    async #registrarMovimentacao(tipo) {
        const valor     = parseFloat(document.getElementById('valor')?.value);
        const descricao = document.getElementById('descricao')?.value;

        this.#checkout.adicionarMovimentacao(tipo, valor, descricao);
        await this.#checkout.lancar(tipo, valor, descricao);
        await this.#carregarHistorico();
    }

    async #carregarHistorico() {
        const container = document.getElementById('lista-historico');
        if (!container) return;

        try {
            const movimentacoes = await this.#checkout.getHistorico();

            if (movimentacoes.length === 0) {
                container.innerHTML = '<li>Nenhuma movimentação hoje.</li>';
                return;
            }

            container.innerHTML = movimentacoes.map(mov => `
                <li>
                    <strong>${mov.descricao}</strong>
                    <span style="color: ${mov.tipo === 'entrada' ? '#48bb78' : '#f56565'}">
                        ${mov.tipo === 'entrada' ? '+' : '-'} R$ ${parseFloat(mov.valor).toFixed(2)}
                    </span>
                </li>
            `).join('');
        } catch (e) {
            console.error('Erro ao carregar histórico:', e);
        }
    }
}