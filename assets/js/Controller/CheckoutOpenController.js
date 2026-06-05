import { BaseController } from './BaseController.js';
import { renderBackButton } from '../components/BackButton.js';

/**
 * CheckoutOpenController
 *
 * Princípios SOLID aplicados:
 *  - SRP: gerencia apenas a tela de abertura de caixa. Não sabe nada sobre
 *         movimentações, fechamento ou pagamento.
 *  - DIP: recebe AuthService e CheckoutService via injeção de dependência.
 */
export class CheckoutOpenController extends BaseController {
    #checkout;

    constructor(auth, checkout) {
        super(auth);
        this.#checkout = checkout;
    }

    bindCheckoutOpen() {
        renderBackButton('Voltar ao Dashboard');
        this.montarNavbar();
        const btnAbrir  = document.getElementById('btn-abrir-caixa');

        if (btnAbrir)  btnAbrir.addEventListener('click', () => this.#abrirCaixa());
    }

    async #abrirCaixa() {
        const valor = parseFloat(document.getElementById('valor_abertura')?.value);

        if (!valor || valor < 0) {
            alert('Digite um valor de abertura válido.');
            return;
        }

        try {
            await this.#checkout.abrir(valor);
            alert('Caixa aberto com sucesso!');
            window.router.navigate('/checkout/painel');
        } catch (e) {
            if (this.tratarErroAuth(e)) return;
            alert('Erro ao abrir caixa: ' + e.message);
        }
    }
}