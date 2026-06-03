import { BaseController } from './BaseController.js';

/**
 * CheckoutPanelController
 *
 * Princípios SOLID aplicados:
 *  - SRP: responsável apenas pelo painel de movimentações (entradas, saídas,
 *         histórico e navegação para finalização). Não sabe como se abre ou
 *         fecha um caixa administrativamente.
 *  - DIP: depende de CheckoutService e AuthService injetados.
 *  - ISP: expõe apenas o método público necessário para a rota (bindCheckoutOperations).
 */
export class CheckoutPanelController extends BaseController {
    #checkout;

    constructor(auth, checkout) {
        super(auth);
        this.#checkout = checkout;
    }

    // Ponto de entrada chamado pela rota após o HTML ser injetado
    async bindCheckoutOperations() {
        this.#bindBotoes();
        await this.#carregarHistorico();
    }

    #bindBotoes() {
        const btnFechar       = document.getElementById('btn-fechar-caixa');
        const btnEntrada      = document.getElementById('btn-entrada');
        const btnSaida        = document.getElementById('btn-saida');
        const btnLogout       = document.getElementById('btn-logout');
        const btnIrFinalizar  = document.getElementById('btn-ir-finalizar');

        if (btnFechar)      btnFechar.addEventListener('click', () => this.#fecharCaixa());
        if (btnLogout)      btnLogout.addEventListener('click', () => this.logout());
        if (btnIrFinalizar) btnIrFinalizar.addEventListener('click', () => this.#irParaFinalizacao());

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

    async #fecharCaixa() {
        const btn = document.getElementById('btn-fechar-caixa');
        btn.disabled  = true;
        btn.innerText = 'Processando...';

        try {
            const data = await this.#checkout.fechar();
            alert('Caixa fechado! Saldo final: ' + data.summary.final_balance);
            window.router.navigate('/checkout/abrir');
        } catch (e) {
            if (this.tratarErroAuth(e)) return;
            alert('Erro ao fechar caixa: ' + e.message);
        } finally {
            btn.disabled  = false;
            btn.innerText = 'Fechar Caixa';
        }
    }

    async #registrarMovimentacao(tipo) {
        const valor    = parseFloat(document.getElementById('valor')?.value);
        const descricao = document.getElementById('descricao')?.value;

        this.#checkout.adicionarMovimentacao(tipo, valor, descricao);
        await this.#checkout.lancar(tipo, valor, descricao);
        await this.#carregarHistorico();
    }

    #irParaFinalizacao() {
        const total = this.#checkout.calcularTotal();
        this.#checkout.setValorVenda(total);
        window.router.navigate('/checkout/finalizar');
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