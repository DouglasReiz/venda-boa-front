import { BaseController } from './BaseController.js';
import { renderBackButton } from '../components/BackButton.js';

/**
 * CheckoutCloseController
 *
 * SRP: gerencia exclusivamente a tela de fechamento de caixa.
 *
 * Fluxo:
 *  1. bindCheckoutClose() é chamado pela rota após o HTML montar
 *  2. Busca o resumo do turno via checkout.getResumoFechamento()
 *  3. Preenche os campos e habilita o botão de confirmação
 *  4. Ao confirmar: chama checkout.fechar(), exibe o saldo final e navega
 */
export class CheckoutCloseController extends BaseController {
    #checkout;

    constructor(auth, checkout) {
        super(auth);
        this.#checkout = checkout;
    }

    async bindCheckoutClose() {
        renderBackButton('Voltar ao Painel');
        this.montarNavbar();
        this.#bindCancelar();
        await this.#carregarResumo();
    }

    // ── Privados ──────────────────────────────────────────────────────────────

    /**
     * Busca o histórico, calcula o resumo localmente e preenche a tela.
     * Não chama closeCheckout ainda — só exibe os dados para o operador revisar.
     */
    async #carregarResumo() {
        try {
            const movimentacoes = await this.#checkout.getHistoricoCompleto();

            const entradas = movimentacoes
                .filter(m => m.tipo === 'entrada' || m.tipo === 'suprimento')
                .reduce((acc, m) => acc + parseFloat(m.valor), 0);

            const saidas = movimentacoes
                .filter(m => m.tipo === 'saida')
                .reduce((acc, m) => acc + parseFloat(m.valor), 0);

            const abertura = await this.#checkout.getValorAbertura();
            const saldoFinal = abertura + entradas - saidas;

            // Esconde loading, exibe as linhas
            this.#setDisplay('close-loading', 'none');
            this.#setDisplay('close-rows',    'flex');

            this.#setText('close-abertura',   this.#fmt(abertura));
            this.#setText('close-entradas',   this.#fmt(entradas));
            this.#setText('close-saidas',     this.#fmt(saidas));
            this.#setText('close-saldo-final', this.#fmt(saldoFinal));

            // Colore o saldo final: verde se positivo, vermelho se negativo
            const elSaldo = document.getElementById('close-saldo-final');
            if (elSaldo) {
                elSaldo.className = `close-row-value ${saldoFinal >= 0 ? 'positive' : 'negative'}`;
            }

            // Habilita o botão apenas após os dados carregarem
            const btn = document.getElementById('btn-confirmar-fechamento');
            if (btn) {
                btn.disabled = false;
                btn.addEventListener('click', () => this.#confirmarFechamento());
            }
        } catch (e) {
            this.#setDisplay('close-loading', 'none');
            this.#setDisplay('close-rows',    'flex');
            this.#setText('close-abertura',   'Erro');
            console.error('Erro ao carregar resumo:', e);
        }
    }

    async #confirmarFechamento() {
        const btn = document.getElementById('btn-confirmar-fechamento');
        btn.disabled    = true;
        btn.textContent = 'Fechando...';

        try {
            // Chama a API — ela retorna summary com os campos calculados no backend
            const { summary } = await this.#checkout.fechar();

            // Exibe o saldo final retornado pela API (fonte da verdade)
            const saldo = parseFloat(summary.final_balance ?? 0).toFixed(2);
            alert(`Caixa fechado! Saldo final: R$ ${saldo}`);

            this.#checkout.resetarVenda();
            window.router.navigate('/checkout/abrir');
        } catch (e) {
            if (this.tratarErroAuth(e)) return;
            alert('Erro ao fechar caixa: ' + e.message);

            btn.disabled    = false;
            btn.textContent = 'Confirmar Fechamento';
        }
    }

    #bindCancelar() {
        const btn = document.getElementById('btn-cancelar-fechamento');
        if (btn) btn.addEventListener('click', () => window.router.navigate('/pdv'));
    }

    #setText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    #setDisplay(id, value) {
        const el = document.getElementById(id);
        if (el) el.style.display = value;
    }

    #fmt(valor) {
        return `R$ ${parseFloat(valor).toFixed(2)}`;
    }
}