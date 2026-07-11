import { BaseController } from './BaseController.js';

/**
 * AdminProductsController
 *
 * SRP: gerencia exclusivamente a tela de administração de produtos.
 * Responsabilidades:
 *  - Listar / criar / desativar categorias
 *  - Listar / criar / desativar produtos
 *  - Gerenciar variantes inline no formulário de produto
 */
export class AdminProductsController extends BaseController {
    #products;
    #categorias = [];
    #editCatId = null; // id da categoria em edição (null = criação)
    #variantesTemp = []; // variantes pendentes antes de salvar o produto

    constructor(auth, productService) {
        super(auth);
        this.#products = productService;
    }

    async init() {
        this.montarNavbar();
        this.#bindFormCategorias();
        this.#bindFormProdutos();
        await Promise.all([
            this.#carregarCategorias(),
            this.#carregarProdutos(),
        ]);
    }

    // ── Categorias ────────────────────────────────────────────────────────────

    #bindFormCategorias() {
        document.getElementById('btn-nova-categoria')
            ?.addEventListener('click', () => this.#abrirFormCategoria());

        document.getElementById('btn-salvar-categoria')
            ?.addEventListener('click', () => this.#salvarCategoria());

        document.getElementById('btn-cancelar-categoria')
            ?.addEventListener('click', () => this.#fecharFormCategoria());
    }

    #abrirFormCategoria(cat = null) {
        this.#editCatId = cat?.id ?? null;
        document.getElementById('cat-nome').value = cat?.nome ?? '';
        document.getElementById('cat-cor').value = cat?.cor ?? '#e8720c';
        this.#toggleForm('form-categoria', true);
    }

    #fecharFormCategoria() {
        this.#editCatId = null;
        this.#toggleForm('form-categoria', false);
    }

    async #salvarCategoria() {
        const nome = document.getElementById('cat-nome').value.trim();
        const cor = document.getElementById('cat-cor').value;
        if (!nome) { alert('Informe o nome da categoria.'); return; }

        try {
            if (this.#editCatId) {
                await this.#products.atualizarCategoria(this.#editCatId, { nome, cor });
            } else {
                await this.#products.criarCategoria({ nome, cor });
            }
            this.#fecharFormCategoria();
            await this.#carregarCategorias();
            await this.#atualizarSelectCategorias();
        } catch (e) {
            if (this.tratarErroAuth(e)) return;
            alert('Erro ao salvar categoria: ' + e.message);
        }
    }

    async #carregarCategorias() {
        const lista = document.getElementById('lista-categorias');
        if (!lista) return;

        try {
            this.#categorias = await this.#products.getCategorias();
            lista.innerHTML = this.#categorias.length === 0
                ? '<li class="admin-list-empty">Nenhuma categoria cadastrada.</li>'
                : this.#categorias.map(cat => `
                    <li class="admin-list-item">
                        <div class="admin-list-item-info">
                            <span class="cat-badge" style="background:${cat.cor}"></span>
                            <span>${cat.nome}</span>
                        </div>
                        <div class="admin-list-item-actions">
                            <button class="btn-icon" data-action="edit-cat" data-id="${cat.id}"
                                    title="Editar">✏️</button>
                            <button class="btn-icon danger" data-action="del-cat" data-id="${cat.id}"
                                    title="Remover">🗑️</button>
                        </div>
                    </li>
                `).join('');

            // Delegação de eventos
            lista.onclick = (e) => {
                const btn = e.target.closest('[data-action]');
                if (!btn) return;
                const { action, id } = btn.dataset;
                if (action === 'edit-cat') {
                    const cat = this.#categorias.find(c => c.id == id);
                    this.#abrirFormCategoria(cat);
                }
                if (action === 'del-cat') this.#deletarCategoria(id);
            };
        } catch (e) {
            lista.innerHTML = '<li class="admin-list-empty">Erro ao carregar categorias.</li>';
        }
    }

    async #deletarCategoria(id) {
        if (!confirm('Remover esta categoria? Os produtos vinculados também serão removidos.')) return;
        try {
            await this.#products.deletarCategoria(id);
            await Promise.all([this.#carregarCategorias(), this.#carregarProdutos()]);
        } catch (e) {
            alert('Erro: ' + e.message);
        }
    }

    // ── Produtos ──────────────────────────────────────────────────────────────

    #bindFormProdutos() {
        document.getElementById('btn-novo-produto')
            ?.addEventListener('click', () => this.#abrirFormProduto());

        document.getElementById('btn-salvar-produto')
            ?.addEventListener('click', () => this.#salvarProduto());

        document.getElementById('btn-cancelar-produto')
            ?.addEventListener('click', () => this.#fecharFormProduto());

        // Toggle variantes
        document.getElementById('prod-tem-variantes')
            ?.addEventListener('change', (e) => {
                this.#toggleForm('variantes-container', e.target.checked);
            });

        // Adicionar linha de variante
        document.getElementById('btn-add-variante')
            ?.addEventListener('click', () => this.#adicionarLinhaVariante());
    }

    #abrirFormProduto() {
        this.#variantesTemp = [];
        document.getElementById('prod-categoria').value = '';
        document.getElementById('prod-nome').value = '';
        document.getElementById('prod-codigo').value = '';   // NOVO
        document.getElementById('prod-preco').value = '';
        document.getElementById('prod-descricao').value = '';
        document.getElementById('prod-tem-variantes').checked = false;
        document.getElementById('lista-variantes-form').innerHTML = '';
        this.#toggleForm('variantes-container', false);
        this.#toggleForm('form-produto', true);
        this.#atualizarSelectCategorias();
    }

    #fecharFormProduto() {
        this.#variantesTemp = [];
        this.#toggleForm('form-produto', false);
    }

    async #salvarProduto() {
        const category_id = document.getElementById('prod-categoria').value;
        const nome = document.getElementById('prod-nome').value.trim();
        const codigo = document.getElementById('prod-codigo').value.trim();
        const preco = parseFloat(document.getElementById('prod-preco').value);
        const descricao = document.getElementById('prod-descricao').value.trim();
        const tem_variantes = document.getElementById('prod-tem-variantes').checked;

        if (!category_id) { alert('Selecione uma categoria.'); return; }
        if (!nome) { alert('Informe o nome do produto.'); return; }
        if (!preco || preco <= 0) { alert('Informe um preço válido.'); return; }

        const payload = {
            category_id,
            nome,
            codigo: codigo || null,
            preco,
            descricao: descricao || null,
            tem_variantes,
            variantes: tem_variantes ? this.#coletarVariantes() : [],
        };

        try {
            await this.#products.criarProduto(payload);
            this.#fecharFormProduto();
            await this.#carregarProdutos();
        } catch (e) {
            if (this.tratarErroAuth(e)) return;
            alert('Erro ao salvar produto: ' + e.message);
        }
    }

    async #carregarProdutos() {
        const lista = document.getElementById('lista-produtos');
        if (!lista) return;

        try {
            const produtos = await this.#products.getProdutos();
            lista.innerHTML = produtos.length === 0
                ? '<li class="admin-list-empty">Nenhum produto cadastrado.</li>'
                : produtos.map(p => `
                    <li class="admin-list-item">
                        <div class="admin-list-item-info">
                            <span class="prod-name">
                                ${p.nome}
                                ${p.codigo ? `<span class="prod-codigo">#${p.codigo}</span>` : ''}
                            </span>
                            <span class="prod-meta">
                                ${p.category?.nome ?? '—'} •
                                R$ ${parseFloat(p.preco).toFixed(2)}
                                ${p.tem_variantes ? '• <em>com variantes</em>' : ''}
                            </span>
                        </div>
                        <div class="admin-list-item-actions">
                            <button class="btn-icon danger" data-action="del-prod" data-id="${p.id}"
                                    title="Remover">🗑️</button>
                        </div>
                    </li>
                `).join('');

            lista.onclick = (e) => {
                const btn = e.target.closest('[data-action]');
                if (!btn) return;
                if (btn.dataset.action === 'del-prod') this.#deletarProduto(btn.dataset.id);
            };
        } catch (e) {
            lista.innerHTML = '<li class="admin-list-empty">Erro ao carregar produtos.</li>';
        }
    }

    async #deletarProduto(id) {
        if (!confirm('Remover este produto?')) return;
        try {
            await this.#products.deletarProduto(id);
            await this.#carregarProdutos();
        } catch (e) {
            alert('Erro: ' + e.message);
        }
    }

    // ── Variantes (formulário inline) ─────────────────────────────────────────

    #adicionarLinhaVariante() {
        const container = document.getElementById('lista-variantes-form');
        const idx = container.children.length;
        const div = document.createElement('div');
        div.className = 'variante-row';
        div.innerHTML = `
            <input type="text"   placeholder="Nome (ex: P, M, Frango)"
                   class="var-nome" data-idx="${idx}">
            <input type="number" placeholder="Preço" step="0.01" min="0.01"
                   class="var-preco" data-idx="${idx}">
            <button class="btn-icon danger btn-rm-variante" data-idx="${idx}">✕</button>
        `;
        div.querySelector('.btn-rm-variante').addEventListener('click', () => div.remove());
        container.appendChild(div);
    }

    #coletarVariantes() {
        return [...document.querySelectorAll('.variante-row')].map(row => ({
            nome: row.querySelector('.var-nome').value.trim(),
            preco: parseFloat(row.querySelector('.var-preco').value),
        })).filter(v => v.nome && v.preco > 0);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    #atualizarSelectCategorias() {
        const sel = document.getElementById('prod-categoria');
        if (!sel) return;
        sel.innerHTML = '<option value="">Selecione a categoria</option>' +
            this.#categorias.map(c =>
                `<option value="${c.id}">${c.nome}</option>`
            ).join('');
    }

    #toggleForm(id, show) {
        document.getElementById(id)?.classList.toggle('hidden', !show);
    }
}