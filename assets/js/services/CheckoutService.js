export class CheckoutService {
    #api;
    #movimentacoes = []; // Guarda a lista localmente
    #valorVenda = 0;

    constructor(api) {
        this.#api = api;
    }

    // Método para calcular o total com base nas movimentações do caixa
    calcularTotal() {
        // Exemplo: soma entradas e subtrai saídas
        return this.#movimentacoes.reduce((acc, mov) => {
            return mov.tipo === 'entrada' ? acc + mov.valor : acc - mov.valor;
        }, 0);
    }

    setValorVenda(valor) {
        this.#valorVenda = valor;
    }

    getValorVenda() {
        return this.#valorVenda;
    }

    // Adicione esta lógica para manter o histórico local atualizado
    adicionarMovimentacao(tipo, valor, descricao) {
        this.#movimentacoes.push({ tipo, valor: parseFloat(valor), descricao });
    }

    // Adicione este método para finalizar a venda na API
    async finalizarCompra(valor, metodoPagamento) {
        // Usamos o método .post() que seu ApiClient já possui
        return await this.#api.post('/checkout/finalizar-venda', {
            valor: valor,
            metodo_pagamento: metodoPagamento
        });
    }

    abrir(valor) { return this.#api.post('/checkout/open', { valor_abertura: valor }); }
    fechar() { return this.#api.post('/checkout/close'); }
    lancar(tipo, valor, desc) { return this.#api.post('/checkout/launch', { tipo, valor, descricao: desc, metodo_pagamento: 'dinheiro' }); }
    getHistorico() { return this.#api.get('/checkout/history'); }
}