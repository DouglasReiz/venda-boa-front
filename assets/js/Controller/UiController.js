export class UIController {
    #auth;
    #checkout;

    constructor(auth, checkout) {
        this.#auth = auth;
        this.#checkout = checkout;
    }

    bindLogin() {
        const btn = document.getElementById('btn-login');
        if (btn) btn.addEventListener('click', () => this.login());
    }

    bindDashboard() {
        const btnCheckout = document.getElementById('btn-ir-checkout');
        const btnLogout = document.getElementById('btn-logout');

        if (btnCheckout) btnCheckout.addEventListener('click', () => window.router.navigate('/checkout/abrir'));
        if (btnLogout) btnLogout.addEventListener('click', () => this.logout());
    }

    bindCheckoutOpen() {
        const btnAbrir = document.getElementById('btn-abrir-caixa');
        const btnLogout = document.getElementById('btn-logout');

        if (btnAbrir) btnAbrir.addEventListener('click', () => this.abrirCaixa());
        if (btnLogout) btnLogout.addEventListener('click', () => this.logout());
    }

    bindCheckoutOperations() {
        const btnFechar = document.getElementById('btn-fechar-caixa');
        const btnEntrada = document.getElementById('btn-entrada');
        const btnSaida = document.getElementById('btn-saida');
        const btnLogout = document.getElementById('btn-logout');
        const btnIrParaFinalizar = document.getElementById('btn-ir-finalizar');

        if (btnFechar) btnFechar.addEventListener('click', () => this.fecharCaixa());
        if (btnEntrada) btnEntrada.addEventListener('click', async () => {
            await this.registrarMovimentacao('entrada');
            this.carregarHistorico(); // Recarrega após ação
        });
        if (btnSaida) btnSaida.addEventListener('click', async () => {
            await this.registrarMovimentacao('saida');
            this.carregarHistorico(); // Recarrega após ação
        });
        if (btnLogout) btnLogout.addEventListener('click', () => this.logout());

        // CARREGA O HISTÓRICO ASSIM QUE A TELA MONTA
        this.carregarHistorico();

        if (btnIrParaFinalizar) {
            btnIrParaFinalizar.addEventListener('click', () => {
                // 1. Pega o valor total que você calculou ou tem em tela
                const total = this.#checkout.calcularTotal();

                // 2. Salva no serviço
                this.#checkout.setValorVenda(total);

                // 3. Navega
                window.router.navigate('/checkout/finalizar');
            });
        }
    }

    async login() {
        const email = document.getElementById('email').value;
        const senha = document.getElementById('password').value;
        if (!email || !senha) { alert('Preencha e-mail e senha!'); return; }

        try {
            await this.#auth.login(email, senha);
            window.router.navigate('/dashboard');
        } catch (e) {
            alert('Falha no login: ' + e.message);
        }
    }

    async abrirCaixa() {
        const valor = parseFloat(document.getElementById('valor_abertura').value);
        if (!valor || valor < 0) { alert('Digite um valor de abertura válido.'); return; }

        try {
            await this.#checkout.abrir(valor);
            alert('Caixa aberto com sucesso!');
            // Avança para o painel de movimentações após abrir
            window.router.navigate('/checkout/painel');
        } catch (e) {
            if (e.name === 'UnauthorizedError') { this.#sessaoExpirada(); return; }
            alert('Erro ao abrir caixa: ' + e.message);
        }
    }

    async fecharCaixa() {
        const btn = document.getElementById('btn-fechar-caixa');
        btn.disabled = true;
        btn.innerText = 'Processando...';

        try {
            const data = await this.#checkout.fechar();
            alert('Caixa fechado! Saldo final: ' + data.summary.final_balance);
            // Retorna para a tela de abertura após o encerramento do turno
            window.router.navigate('/checkout/abrir');
        } catch (e) {
            if (e.name === 'UnauthorizedError') { this.#sessaoExpirada(); return; }
            alert('Erro ao fechar caixa: ' + e.message);
        } finally {
            btn.disabled = false;
            btn.innerText = 'Fechar Caixa';
        }
    }

    async registrarMovimentacao(tipo) {
        const valor = parseFloat(document.getElementById('valor').value);
        const descricao = document.getElementById('descricao').value;

        // 1. Atualiza o serviço (lógica local)
        this.#checkout.adicionarMovimentacao(tipo, valor, descricao);

        // 2. Atualiza a API
        await this.#checkout.lancar(tipo, valor, descricao);

        // 3. Atualiza a tela
        this.carregarHistorico();
    }

    // Para o botão que vai para a finalização
    irParaFinalizacao() {
        const total = this.#checkout.calcularTotal();
        this.#checkout.setValorVenda(total);
        window.router.navigate('/checkout/finalizar');
    }

    async carregarHistorico() {
        try {
            // Supondo que seu CheckoutService tenha um método 'getHistorico' ou similar
            // Se ainda não tiver, você precisará criá-lo no CheckoutService
            const movimentacoes = await this.#checkout.getHistorico();

            const container = document.getElementById('lista-historico');
            if (!container) return;

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
            console.error("Erro ao carregar histórico:", e);
        }
    }

    atualizarHistorico(listaMovimentacoes) {
        const container = document.getElementById('lista-historico');
        if (!container) return;

        container.innerHTML = listaMovimentacoes.map(mov => `
        <li>
            <span>${mov.descricao}</span>
            <span style="color: ${mov.tipo === 'entrada' ? '#48bb78' : '#f56565'}">
                R$ ${mov.valor}
            </span>
        </li>
    `).join('');
    }

    logout() {
        this.#auth.logout();
        window.router.navigate('/login');
    }

    // Privado — evita repetir esse bloco em todo catch
    #sessaoExpirada() {
        alert('Sessão expirada. Faça login novamente.');
        this.logout();
    }

    // Dentro da classe UIController

    async processarPagamento(valorTotal, formaPagamento) {
        try {
            // Mostra um estado de carregando se quiser (opcional)
            alert('Processando pagamento...');

            // Chamada direta para o serviço
            await this.#checkout.finalizarCompra(valorTotal, formaPagamento);

            alert('Venda registrada com sucesso!');
            window.router.navigate('/dashboard'); // Volta para o início
        } catch (e) {
            // Graças ao seu ApiClient, ele vai capturar o erro da API (401, 500, etc)
            if (e instanceof UnauthorizedError) {
                alert('Sessão expirada!');
                this.logout();
            } else {
                alert('Erro na API: ' + e.message);
            }
        }
    }
}