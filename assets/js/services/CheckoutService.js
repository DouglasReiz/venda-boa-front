export class CheckoutService {
    #api;
    #movimentacoes   = [];
    #valorVenda      = 0;
    #vendaFinalizada = false;

    constructor(api) {
        this.#api = api;
    }

    // ── Cálculo local ─────────────────────────────────────────────────────────

    calcularTotal() {
        return this.#movimentacoes.reduce((acc, mov) => {
            return mov.tipo === 'entrada' ? acc + mov.valor : acc - mov.valor;
        }, 0);
    }

    adicionarMovimentacao(tipo, valor, descricao) {
        this.#vendaFinalizada = false;
        this.#movimentacoes.push({ tipo, valor: parseFloat(valor), descricao });
    }

    // ── Estado da venda ───────────────────────────────────────────────────────

    setValorVenda(valor) { this.#valorVenda = valor; }
    getValorVenda()      { return this.#valorVenda; }

    resetarVenda() {
        this.#movimentacoes  = [];
        this.#valorVenda     = 0;
        this.#vendaFinalizada = true;
    }

    // ── API ───────────────────────────────────────────────────────────────────

    abrir(valor) {
        return this.#api.post('/checkout/open', { valor_abertura: valor });
    }

    fechar() {
        return this.#api.post('/checkout/close');
    }

    lancar(tipo, valor, desc) {
        return this.#api.post('/checkout/launch', {
            tipo,
            valor,
            descricao:        desc,
            metodo_pagamento: 'dinheiro',
        });
    }

    /**
     * Usado no painel de movimentações.
     * Retorna [] após resetarVenda() para zerar o histórico visual da venda anterior.
     */
    async getHistorico() {
        if (this.#vendaFinalizada) return [];
        return this.#api.get('/checkout/history');
    }

    /**
     * Usado na tela de fechamento.
     * Ignora a flag #vendaFinalizada — precisa de TODAS as transações do turno.
     */
    getHistoricoCompleto() {
        return this.#api.get('/checkout/history');
    }

    /**
     * Busca o checkout aberto e retorna o valor_abertura.
     * Usado para calcular o saldo final na tela de fechamento.
     */
    async getValorAbertura() {
        const checkouts = await this.#api.get('/admin/caixas-abertos');
        const meu = Array.isArray(checkouts) ? checkouts[0] : null;
        return parseFloat(meu?.valor_abertura ?? 0);
    }

    finalizarCompra(valor, metodoPagamento, parcelas = 1) {
        return this.#api.post('/checkout/finalizar-venda', {
            valor,
            metodo_pagamento: metodoPagamento,
            parcelas,
        });
    }
}