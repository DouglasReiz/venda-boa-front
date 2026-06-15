/* ==========================================================================
   pages/products.js
   Contém: adminProductsPage, pdvPage, stockPage
   ========================================================================== */


/**
 * adminProductsPage
 * Tela de gerenciamento de categorias e produtos (acesso admin).
 */
export function adminProductsPage() {
    return `
    <div class="admin-products-layout">

        <!-- Coluna esquerda: Categorias -->
        <section class="admin-section">
            <div class="admin-section-header">
                <h2>Categorias</h2>
                <button class="btn btn-primary btn-sm" id="btn-nova-categoria">+ Nova</button>
            </div>

            <!-- Formulário inline (oculto por padrão) -->
            <div class="admin-form hidden" id="form-categoria">
                <input type="text"   id="cat-nome"  placeholder="Nome da categoria">
                <div class="color-row">
                    <label>Cor</label>
                    <input type="color" id="cat-cor" value="#e8720c" class="color-input">
                </div>
                <div class="button-row">
                    <button class="btn btn-primary" id="btn-salvar-categoria">Salvar</button>
                    <button class="btn btn-ghost"   id="btn-cancelar-categoria">Cancelar</button>
                </div>
            </div>

            <ul class="admin-list" id="lista-categorias">
                <li class="admin-list-loading">Carregando...</li>
            </ul>
        </section>

        <!-- Coluna direita: Produtos -->
        <section class="admin-section">
            <div class="admin-section-header">
                <h2>Produtos</h2>
                <button class="btn btn-primary btn-sm" id="btn-novo-produto">+ Novo</button>
            </div>

            <!-- Formulário inline (oculto por padrão) -->
            <div class="admin-form hidden" id="form-produto">
                <select id="prod-categoria">
                    <option value="">Selecione a categoria</option>
                </select>
                <input type="text"   id="prod-nome"   placeholder="Nome do produto">
                <input type="number" id="prod-preco"  placeholder="Preço (R$)" step="0.01" min="0.01">
                <input type="text"   id="prod-descricao" placeholder="Descrição (opcional)">

                <div class="toggle-row">
                    <label class="toggle-label">
                        <input type="checkbox" id="prod-tem-variantes">
                        <span>Tem variantes (ex: tamanhos, sabores)</span>
                    </label>
                </div>

                <!-- Bloco de variantes — aparece ao marcar o toggle -->
                <div class="variantes-container hidden" id="variantes-container">
                    <p class="variantes-titulo">Variantes</p>
                    <div id="lista-variantes-form"></div>
                    <button class="btn btn-ghost btn-sm" id="btn-add-variante" type="button">
                        + Adicionar variante
                    </button>
                </div>

                <div class="button-row" style="margin-top: 12px;">
                    <button class="btn btn-primary" id="btn-salvar-produto">Salvar</button>
                    <button class="btn btn-ghost"   id="btn-cancelar-produto">Cancelar</button>
                </div>
            </div>

            <ul class="admin-list" id="lista-produtos">
                <li class="admin-list-loading">Carregando...</li>
            </ul>
        </section>

    </div>
    `;
}


/**
 * pdvPage — tela unificada
 * Grade de produtos + carrinho + movimentações manuais + histórico + fechamento
 */
export function pdvPage() {
    return `
    <div class="pdv-unified-layout">

        <!-- ── Coluna central: catálogo ── -->
        <div class="pdv-catalog">

            <div class="pdv-categories" id="pdv-categories">
                <button class="pdv-cat-btn active" data-cat="all">Todos</button>
            </div>

            <div class="pdv-grid" id="pdv-grid">
                <div class="pdv-loading">Carregando produtos...</div>
            </div>

        </div>

        <!-- ── Coluna direita: painel lateral ── -->
        <aside class="pdv-side">

            <!-- Carrinho -->
            <div class="pdv-side-section pdv-cart">
                <div class="pdv-cart-header">
                    <h3>Carrinho</h3>
                    <button class="btn-limpar-cart" id="btn-limpar-cart" title="Limpar">✕</button>
                </div>

                <ul class="pdv-cart-list" id="pdv-cart-list">
                    <li class="pdv-cart-empty">Nenhum item adicionado.</li>
                </ul>

                <div class="pdv-cart-footer">
                    <div class="pdv-cart-total">
                        <span>Total da venda</span>
                        <strong id="pdv-total">R$ 0,00</strong>
                    </div>
                    <button class="btn btn-success" id="btn-pdv-finalizar" disabled>
                        Finalizar Venda
                    </button>
                </div>
            </div>

            <!-- Movimentação manual -->
            <div class="pdv-side-section">
                <h3 class="pdv-side-title">Movimentação Manual</h3>
                <input type="number" id="valor"     placeholder="Valor (R$)">
                <input type="text"   id="descricao" placeholder="Descrição">
                <div class="button-row">
                    <button id="btn-entrada" class="btn btn-entrada">+ Entrada</button>
                    <button id="btn-saida"   class="btn btn-saida">− Saída</button>
                </div>
            </div>

            <!-- Histórico -->
            <div class="pdv-side-section pdv-historico-section">
                <h3 class="pdv-side-title">Últimos Lançamentos</h3>
                <ul id="lista-historico" class="pdv-historico-list">
                    <li>Carregando...</li>
                </ul>
            </div>

            <!-- Ações do turno -->
            <div class="pdv-side-section pdv-turno-actions">
                <button id="btn-fechar-caixa" class="btn btn-fechar">
                    Fechar Caixa
                </button>
            </div>

        </aside>

    </div>

    <!-- Modal de variantes -->
    <div class="pdv-modal-overlay hidden" id="modal-variantes">
        <div class="pdv-modal">
            <h3 id="modal-produto-nome">Escolha a variante</h3>
            <div class="modal-variantes-grid" id="modal-variantes-grid"></div>
            <button class="btn btn-ghost" id="btn-fechar-modal" style="margin-top:12px;">
                Cancelar
            </button>
        </div>
    </div>
    `;
}


/* ==========================================================================
   stockPage — Visão geral e ajuste de estoque
   ========================================================================== */

export function stockPage() {
    return `
    <div class="page-centered" style="max-width: 860px;">

        <!-- Alertas de estoque baixo -->
        <div class="stock-alerts-bar" id="stock-alerts-bar" style="display:none;">
            <span class="alert-icon">⚠️</span>
            <span id="stock-alerts-text">Carregando alertas...</span>
        </div>

        <!-- Visão geral -->
        <div class="glass-card">
            <div class="admin-section-header">
                <h2>Controle de Estoque</h2>
            </div>

            <div id="stock-list">
                <p class="admin-list-loading">Carregando...</p>
            </div>
        </div>

    </div>
    `;
}