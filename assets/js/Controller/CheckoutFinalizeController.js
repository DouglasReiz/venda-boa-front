import { BaseController } from './BaseController.js';
import { renderBackButton } from '../components/BackButton.js';

/**
 * CheckoutFinalizeController
 *
 * Responsabilidades (SRP):
 *  - Vincular os eventos da tela de pagamento
 *  - Calcular troco em tempo real
 *  - Enviar o pagamento para o CheckoutService
 *  - Após confirmação: limpar histórico, resetar estado e navegar para nova venda
 */
export class CheckoutFinalizeController extends BaseController {
    #checkout;
    #valorTotal;

    constructor(auth, checkout) {
        super(auth);
        this.#checkout = checkout;
    }

    bindCheckoutFinalizacao(valorTotal) {
        renderBackButton('Voltar ao Painel');
        this.montarNavbar();
        this.#valorTotal = parseFloat(valorTotal) || 0;
        this.#bindMetodos();
        this.#bindCancelar();
    }

    // ── Privados ──────────────────────────────────────────────────────────────

    #bindMetodos() {
        document.querySelectorAll('input[name="forma_pagamento"]').forEach(radio => {
            radio.addEventListener('change', () => this.#onMetodoChange(radio.value));
        });
    }

    #onMetodoChange(metodo) {
        this.#setVisible('field-troco',    false);
        this.#setVisible('field-parcelas', false);

        if (metodo === 'dinheiro') {
            this.#setVisible('field-troco', true);
            this.#bindTroco();
        }

        if (metodo === 'credito') {
            this.#setVisible('field-parcelas', true);
        }

        const btn = document.getElementById('btn-confirmar-pagamento');
        if (btn) {
            btn.disabled = false;
            btn.onclick  = () => this.#confirmarPagamento(metodo);
        }
    }

    #bindTroco() {
        const input = document.getElementById('valor-recebido');
        if (!input) return;
        input.oninput = () => this.#calcularTroco(parseFloat(input.value) || 0);
    }

    #calcularTroco(valorRecebido) {
        const troco = valorRecebido - this.#valorTotal;
        const el    = document.getElementById('troco-calculado');
        if (!el) return;
        el.textContent = `R$ ${Math.abs(troco).toFixed(2)}`;
        el.classList.toggle('negativo', troco < 0);
    }

    #bindCancelar() {
        const btn = document.getElementById('btn-cancelar-pagamento');
        if (btn) btn.addEventListener('click', () => window.router.navigate('/pdv'));
    }

    async #confirmarPagamento(metodo) {
        const btn = document.getElementById('btn-confirmar-pagamento');

        if (metodo === 'dinheiro') {
            const recebido = parseFloat(document.getElementById('valor-recebido')?.value) || 0;
            if (recebido < this.#valorTotal) {
                alert('Valor recebido é menor que o total da compra.');
                return;
            }
        }

        const parcelas = metodo === 'credito'
            ? parseInt(document.getElementById('parcelas-select')?.value) || 1
            : 1;

        btn.disabled    = true;
        btn.classList.add('loading');
        btn.textContent = 'Processando...';

        try {
            await this.#checkout.finalizarCompra(this.#valorTotal, metodo, parcelas);

            // 1. Limpa o estado em memória (movimentações locais + valorVenda)
            this.#checkout.resetarVenda();

            // 2. Limpa o DOM do histórico para não exibir dados da venda anterior
            //    quando o CheckoutPanelController montar e recarregar do banco
            const listaHistorico = document.getElementById('lista-historico');
            if (listaHistorico) listaHistorico.innerHTML = '';

            alert('Venda finalizada com sucesso!');

            // 3. Volta ao painel — bindCheckoutOperations() vai buscar o histórico
            //    atualizado (sem as transações que acabaram de ser finalizadas,
            //    pois pertencem ao mesmo checkout ainda aberto mas o estado local
            //    foi limpo, indicando início de nova venda)
            window.router.navigate('/pdv');
        } catch (e) {
            if (this.tratarErroAuth(e)) return;
            alert('Erro ao processar pagamento: ' + e.message);

            btn.disabled    = false;
            btn.classList.remove('loading');
            btn.textContent = 'Confirmar pagamento';
        }
    }

    #setVisible(elementId, visible) {
        const el = document.getElementById(elementId);
        if (el) el.classList.toggle('visible', visible);
    }
}