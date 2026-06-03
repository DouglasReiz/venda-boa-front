import { BaseController } from './BaseController.js';
import { UnauthorizedError } from '../ApiClient/Error.js';

/**
 * CheckoutFinalizeController
 *
 * Princípios SOLID aplicados:
 *  - SRP: lida exclusivamente com o passo de pagamento (forma + confirmação).
 *         Não conhece abertura, movimentações nem dashboard.
 *  - DIP: recebe AuthService e CheckoutService por injeção.
 */
export class CheckoutFinalizeController extends BaseController {
    #checkout;

    constructor(auth, checkout) {
        super(auth);
        this.#checkout = checkout;
    }

    // Chamado pela rota; recebe o valor já calculado e injetado pelo router
    bindCheckoutFinalizacao(valorTotal) {
        const btnPagar  = document.getElementById('btn-pagar');
        const btnLogout = document.getElementById('btn-logout');

        if (btnLogout) btnLogout.addEventListener('click', () => this.logout());

        if (btnPagar) {
            btnPagar.addEventListener('click', () => {
                const formaPagamento = document.getElementById('forma_pagamento')?.value;
                this.#processarPagamento(valorTotal, formaPagamento);
            });
        }
    }

    async #processarPagamento(valorTotal, formaPagamento) {
        if (!formaPagamento) {
            alert('Selecione uma forma de pagamento.');
            return;
        }

        try {
            await this.#checkout.finalizarCompra(valorTotal, formaPagamento);
            alert('Venda registrada com sucesso!');
            window.router.navigate('/dashboard');
        } catch (e) {
            if (this.tratarErroAuth(e)) return;
            alert('Erro na API: ' + e.message);
        }
    }
}