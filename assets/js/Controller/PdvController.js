import { BaseController } from './BaseController.js';
import { renderBackButton } from '../components/BackButton.js';

/**
 * PdvController — tela unificada do turno
 *
 * SRP: gerencia a tela principal de operação do caixa.
 *
 * Responsabilidades:
 *  - Carregar e renderizar o catálogo em grade por categoria
 *  - Gerenciar o carrinho (adicionar, remover, limpar, calcular total)
 *  - Lançamentos manuais de entrada/saída
 *  - Exibir histórico do turno
 *  - Redirecionar para /checkout/fechar ao fechar o caixa
 *  - Ao finalizar venda: salva total e navega para /checkout/pagamento
 */
export class PdvController extends BaseController {
    #products;
    #checkout;
    #catalogo = [];
    #carrinho = []; // [{ id, nome, preco, quantidade }]

    constructor(auth, productService, checkoutService) {
        super(auth);
        this.#products = productService;
        this.#checkout = checkoutService;
    }

    async init() {
        this.montarNavbar();
        renderBackButton('Voltar ao Dashboard');
        this.#bindCarrinho();
        this.#bindMovimentacoes();
        this.#bindFechamento();
        await Promise.all([
            this.#carregarCatalogo(),
            this.#carregarHistorico(),
        ]);
    }

    // ── Catálogo ──────────────────────────────────────────────────────────────

    async #carregarCatalogo() {
        try {
            this.#catalogo = await this.#products.getCatalogo();
            this.#renderCategorias();
            this.#renderGrade('all');
        } catch (e) {
            const grid = document.getElementById('pdv-grid');
            if (grid) grid.innerHTML =
                '<p style="color:var(--color-danger);grid-column:1/-1;text-align:center">Erro ao carregar produtos.</p>';
        }
    }

    #renderCategorias() {
        const bar = document.getElementById('pdv-categories');
        if (!bar) return;

        bar.innerHTML =
            `<button class="pdv-cat-btn active" data-cat="all">Todos</button>` +
            this.#catalogo.map(cat => `
                <button class="pdv-cat-btn" data-cat="${cat.id}">
                    ${cat.nome}
                </button>
            `).join('');

        bar.onclick = (e) => {
            const btn = e.target.closest('.pdv-cat-btn');
            if (!btn) return;
            bar.querySelectorAll('.pdv-cat-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            this.#renderGrade(btn.dataset.cat);
        };
    }

    #renderGrade(catFiltro) {
        const grid = document.getElementById('pdv-grid');
        if (!grid) return;

        const produtos = catFiltro === 'all'
            ? this.#catalogo.flatMap(c => c.products ?? [])
            : (this.#catalogo.find(c => c.id == catFiltro)?.products ?? []);

        if (produtos.length === 0) {
            grid.innerHTML = '<p class="pdv-empty">Nenhum produto nesta categoria.</p>';
            return;
        }

        grid.innerHTML = produtos.map(p => `
            <button class="pdv-product-card" data-id="${p.id}">
                <span class="pdv-product-name">${p.nome}</span>
                <span class="pdv-product-price">
                    R$ ${parseFloat(p.preco).toFixed(2)}
                    ${p.tem_variantes ? '<small>ver variantes</small>' : ''}
                </span>
            </button>
        `).join('');

        grid.onclick = (e) => {
            const card = e.target.closest('.pdv-product-card');
            if (!card) return;
            const produto = produtos.find(p => p.id === parseInt(card.dataset.id));
            if (!produto) return;

            if (produto.tem_variantes && produto.variants?.length > 0) {
                this.#abrirModalVariantes(produto);
            } else {
                this.#adicionarAoCarrinho(produto.id, produto.nome, produto.preco);
            }
        };
    }

    // ── Modal de variantes ────────────────────────────────────────────────────

    #abrirModalVariantes(produto) {
        const overlay = document.getElementById('modal-variantes');
        const grid = document.getElementById('modal-variantes-grid');
        if (!overlay || !grid) return;

        document.getElementById('modal-produto-nome').textContent = produto.nome;

        grid.innerHTML = produto.variants.map(v => `
            <button class="modal-variante-btn"
                    data-nome="${produto.nome} — ${v.nome}"
                    data-preco="${v.preco}"
                    data-id="${produto.id}-${v.id}">
                <span>${v.nome}</span>
                <span>R$ ${parseFloat(v.preco).toFixed(2)}</span>
            </button>
        `).join('');

        grid.onclick = (e) => {
            const btn = e.target.closest('.modal-variante-btn');
            if (!btn) return;
            this.#adicionarAoCarrinho(
                btn.dataset.id,
                btn.dataset.nome,
                parseFloat(btn.dataset.preco),
            );
            this.#fecharModal();
        };

        document.getElementById('btn-fechar-modal')
            ?.addEventListener('click', () => this.#fecharModal(), { once: true });

        overlay.classList.remove('hidden');
    }

    #fecharModal() {
        document.getElementById('modal-variantes')?.classList.add('hidden');
    }

    // ── Carrinho ──────────────────────────────────────────────────────────────

    #bindCarrinho() {
        document.getElementById('btn-limpar-cart')
            ?.addEventListener('click', () => {
                this.#carrinho = [];
                this.#renderCarrinho();
            });

        document.getElementById('btn-pdv-finalizar')
            ?.addEventListener('click', () => this.#finalizarVenda());
    }

    /**
     * @param {string|number} id
     * @param {string}  nome
     * @param {number}  preco     — negativo para saídas manuais
     * @param {boolean} agrupar  — true: incrementa se já existir; false: sempre cria novo item
     */
    #adicionarAoCarrinho(id, nome, preco, agrupar = true) {
        const chave = String(id);
        const item = agrupar ? this.#carrinho.find(i => i.id === chave) : null;
        if (item) {
            item.quantidade++;
        } else {
            this.#carrinho.push({ id: chave, nome, preco, quantidade: 1, variantId: null });
        }
        this.#renderCarrinho();
    }

    #renderCarrinho() {
        const lista = document.getElementById('pdv-cart-list');
        const btnFinalizar = document.getElementById('btn-pdv-finalizar');
        const elTotal = document.getElementById('pdv-total');
        if (!lista) return;

        if (this.#carrinho.length === 0) {
            lista.innerHTML = '<li class="pdv-cart-empty">Nenhum item adicionado.</li>';
            if (btnFinalizar) btnFinalizar.disabled = true;
            if (elTotal) elTotal.textContent = 'R$ 0,00';
            return;
        }

        lista.innerHTML = this.#carrinho.map(item => {
            const isNegativo = item.preco < 0;
            const precoAbs = Math.abs(item.preco);
            const subtotal = item.preco * item.quantidade;
            const corClasse = isNegativo ? 'negativo' : 'positivo';
            const sinal = isNegativo ? '−' : '+';

            // Movimentações manuais (id começa com "manual-") não têm controles de qty
            const isManual = String(item.id).startsWith('manual-');

            return `
            <li class="pdv-cart-item">
                <div class="cart-item-info">
                    <span class="cart-item-nome ${isNegativo ? 'saida-label' : ''}">${item.nome}</span>
                    <span class="cart-item-preco ${corClasse}">
                        ${isManual
                    ? `${sinal} R$ ${precoAbs.toFixed(2)}`
                    : `${item.quantidade}x R$ ${precoAbs.toFixed(2)} = R$ ${Math.abs(subtotal).toFixed(2)}`
                }
                    </span>
                </div>
                <div class="cart-item-controls">
                    ${isManual ? '' : `
                        <button class="cart-qty-btn" data-action="dec" data-id="${item.id}">−</button>
                        <span class="cart-qty">${item.quantidade}</span>
                        <button class="cart-qty-btn" data-action="inc" data-id="${item.id}">+</button>
                    `}
                    <button class="cart-qty-btn danger" data-action="rm" data-id="${item.id}">✕</button>
                </div>
            </li>`;
        }).join('');

        lista.onclick = (e) => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;
            const { action, id } = btn.dataset;
            const item = this.#carrinho.find(i => i.id === id);
            if (!item) return;
            if (action === 'inc') { item.quantidade++; this.#renderCarrinho(); }
            if (action === 'dec') {
                item.quantidade--;
                if (item.quantidade <= 0) this.#carrinho = this.#carrinho.filter(i => i.id !== id);
                this.#renderCarrinho();
            }
            if (action === 'rm') {
                this.#carrinho = this.#carrinho.filter(i => i.id !== id);
                this.#renderCarrinho();
            }
        };

        const total = this.#calcularTotal();
        if (elTotal) {
            elTotal.textContent = `R$ ${Math.abs(total).toFixed(2)}`;
            elTotal.style.color = total < 0
                ? 'var(--color-danger)'
                : 'var(--color-primary)';
        }
        // Só habilita finalizar se o total for positivo
        if (btnFinalizar) btnFinalizar.disabled = total <= 0;
    }

    #calcularTotal() {
        // preco já é negativo para saídas manuais — a soma absorve automaticamente
        return this.#carrinho.reduce((acc, i) => acc + (i.preco * i.quantidade), 0);
    }

    #calcularTotalAbsoluto() {
        // Total absoluto para exibição (sem negativos), usado para o display
        const total = this.#calcularTotal();
        return total;
    }

    // ── Movimentações manuais ─────────────────────────────────────────────────

    #bindMovimentacoes() {
        document.getElementById('btn-entrada')
            ?.addEventListener('click', async () => this.#registrarMovimentacao('entrada'));

        document.getElementById('btn-saida')
            ?.addEventListener('click', async () => this.#registrarMovimentacao('saida'));
    }

    async #registrarMovimentacao(tipo) {
        const valor = parseFloat(document.getElementById('valor')?.value);
        const descricao = document.getElementById('descricao')?.value?.trim() || 'Lançamento manual';

        if (!valor || valor <= 0) { alert('Informe um valor válido.'); return; }

        try {
            // 1. Persiste na API
            await this.#checkout.lancar(tipo, valor, descricao);
            this.#checkout.adicionarMovimentacao(tipo, valor, descricao);

            // 2. Adiciona ao carrinho para compor o total da venda
            //    Entradas somam, saídas subtraem (preço negativo)
            const precoComSinal = tipo === 'entrada' ? valor : -valor;
            this.#adicionarAoCarrinho(
                `manual-${tipo}-${Date.now()}`, // id único para não agrupar
                descricao,
                precoComSinal,
                false // não agrupa com outros itens iguais
            );

            // 3. Limpa os campos
            document.getElementById('valor').value = '';
            document.getElementById('descricao').value = '';

            await this.#carregarHistorico();
        } catch (e) {
            if (this.tratarErroAuth(e)) return;
            alert('Erro ao lançar movimentação: ' + e.message);
        }
    }

    // ── Histórico ─────────────────────────────────────────────────────────────

    async #carregarHistorico() {
        const lista = document.getElementById('lista-historico');
        if (!lista) return;

        try {
            const movs = await this.#checkout.getHistorico();

            if (!movs.length) {
                lista.innerHTML = '<li class="pdv-historico-vazio">Nenhum lançamento ainda.</li>';
                return;
            }

            lista.innerHTML = movs.map(mov => `
                <li class="pdv-historico-item">
                    <span class="hist-desc">${mov.descricao ?? '—'}</span>
                    <span class="hist-valor ${mov.tipo === 'entrada' ? 'positivo' : 'negativo'}">
                        ${mov.tipo === 'entrada' ? '+' : '−'} R$ ${parseFloat(mov.valor).toFixed(2)}
                    </span>
                </li>
            `).join('');
        } catch (e) {
            console.error('Erro ao carregar histórico:', e);
        }
    }

    // ── Fechamento ────────────────────────────────────────────────────────────

    #bindFechamento() {
        document.getElementById('btn-fechar-caixa')
            ?.addEventListener('click', () => window.router.navigate('/checkout/fechar'));
    }

    // ── Finalizar venda ───────────────────────────────────────────────────────

    #finalizarVenda() {
        if (this.#carrinho.length === 0) return;

        const total = this.#calcularTotal();

        // Salva os itens do carrinho para a API de estoque
        // Apenas itens de produto (não manuais) geram baixa de estoque
        const itens = this.#carrinho
            .filter(i => !String(i.id).startsWith('manual-') && i.variantId)
            .map(i => ({
                variant_id: i.variantId,
                quantidade: i.quantidade,
                nome: i.nome,
            }));

        this.#checkout.setValorVenda(total);
        this.#checkout.setItensCarrinho(itens);
        window.router.navigate('/checkout/pagamento');
    }

    // ── Alertas de estoque no PDV ─────────────────────────────────────────────

    async #verificarAlertas() {
        try {
            const alertas = await this.#products.getAlertas();
            if (alertas.length === 0) return;

            const bar = document.getElementById('pdv-stock-alert');
            if (bar) {
                bar.textContent = `⚠️ ${alertas.length} item(s) com estoque baixo`;
                bar.style.display = 'block';
            }
        } catch (e) { /* silencioso — não bloqueia o PDV */ }
    }
}