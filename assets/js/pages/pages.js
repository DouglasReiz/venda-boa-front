/* ==========================================================================
   pages/login.js
   ========================================================================== */

export function loginPage() {
    return `
    <div class="page-centered">
        <div class="card">
            <h1>VendaBoa</h1>
            <input type="email"     id="email"    placeholder="E-mail">
            <input type="password"  id="password" placeholder="Senha">
            <button id="btn-login" class="btn btn-primary">Entrar</button>
        </div>
    </div>
    `;
}


/* ==========================================================================
   pages/dashboard.js
   ========================================================================== */

export function dashboardPage() {
    return `
    <div class="page-grid-2">
        <div class="glass-card">
            <h2>Caixas Abertos</h2>
            <div id="lista-caixas-abertos"></div>
        </div>

        <div class="glass-card">
            <h2>Performance de Vendas</h2>
            <canvas id="graficoVendas"></canvas>
        </div>

        <!-- Navegação rápida -->
        <div class="dashboard-nav">

            <div class="dash-nav-section">
                <p class="dash-nav-label">Caixa</p>
                <div class="dash-nav-group">
                    <button id="btn-ir-checkout" class="btn btn-primary dash-nav-btn">
                        <span class="dash-nav-icon">💰</span>
                        Movimentações
                    </button>
                    <button id="btn-ir-pdv" class="btn btn-success dash-nav-btn">
                        <span class="dash-nav-icon">🛒</span>
                        PDV — Iniciar Venda
                    </button>
                </div>
            </div>

            <div class="dash-nav-section">
                <p class="dash-nav-label">Administração</p>
                <div class="dash-nav-group">
                    <button id="btn-ir-admin-produtos" class="btn btn-neutral dash-nav-btn">
                        <span class="dash-nav-icon">📦</span>
                        Gerenciar Produtos
                    </button>
                    <button id="btn-ir-estoque" class="btn btn-neutral dash-nav-btn">
                        <span class="dash-nav-icon">📊</span>
                        Controle de Estoque
                    </button>
                </div>
            </div>

        </div>
    </div>
    `;
}


/* ==========================================================================
   pages/checkout.js
   ========================================================================== */

/** Tela 1 — Abertura de caixa */
export function checkoutOpenPage() {
    return `
    <div class="page-centered">
        <div class="card">
            <h2>Abrir Caixa</h2>
            <p style="color: rgba(255,255,255,0.6); text-align:center; margin-bottom: 8px;">
                Informe o valor inicial em dinheiro para abrir o turno.
            </p>
            <input type="number" id="valor_abertura"
                   placeholder="Valor de Abertura (ex: 100.00)" step="0.01">
            <button id="btn-abrir-caixa" class="btn btn-primary">Confirmar Abertura</button>
        </div>

    </div>
    `;
}

/** Tela 2 — Painel de movimentações */
export function checkoutOperationsPage() {
    return `
    <div class="page-split">

        <div style="display: flex; flex-direction: column; gap: 20px;">

            <div class="glass-card">
                <h2>Registrar Movimentação</h2>
                <input type="number" id="valor"    placeholder="Valor (R$)">
                <input type="text"   id="descricao" placeholder="Descrição">
                <div class="button-row">
                    <button id="btn-entrada" class="btn btn-entrada">Entrada</button>
                    <button id="btn-saida"   class="btn btn-saida">Saída</button>
                </div>
            </div>

            <!-- Ação principal do turno: finalizar uma venda -->
            <div class="glass-card panel-cta">
                <h2>Finalizar Venda</h2>
                <p class="panel-cta-desc">Calcula o total das movimentações e abre a tela de pagamento.</p>
                <button id="btn-ir-finalizar" class="btn btn-entrada">
                    Ir para Pagamento
                </button>
            </div>

            <!-- Ação de encerramento: fechar o turno do operador -->
            <div class="glass-card">
                <h2>Encerrar Turno</h2>
                <div class="button-row">
                    <button id="btn-fechar-caixa" class="btn btn-fechar">Fechar Caixa</button>
                </div>
            </div>

        </div>

        <div class="glass-card history-panel">
            <h2>Últimos Lançamentos</h2>
            <ul id="lista-historico">
                <li>Carregando histórico...</li>
            </ul>
        </div>

    </div>
    `;
}

/** Tela 3 — Fechamento de caixa */
export function checkoutClosePage() {
    return `
    <div class="page-centered">
        <div class="close-panel">

            <div class="close-header">
                <div class="close-header-icon">⚠️</div>
                <h2 class="close-title">Fechar Caixa</h2>
                <p class="close-subtitle">Revise o resumo do turno antes de confirmar.</p>
            </div>

            <div class="close-summary">

                <div class="close-loading" id="close-loading">
                    <span class="close-loading-dot"></span>
                    <span class="close-loading-dot"></span>
                    <span class="close-loading-dot"></span>
                </div>

                <div class="close-rows" id="close-rows" style="display:none;">
                    <div class="close-summary-row">
                        <span class="close-row-label">Saldo de abertura</span>
                        <span class="close-row-value neutral" id="close-abertura">—</span>
                    </div>
                    <div class="close-summary-row">
                        <span class="close-row-label">Total de entradas</span>
                        <span class="close-row-value positive" id="close-entradas">—</span>
                    </div>
                    <div class="close-summary-row">
                        <span class="close-row-label">Total de saídas</span>
                        <span class="close-row-value negative" id="close-saidas">—</span>
                    </div>
                    <div class="close-summary-divider"></div>
                    <div class="close-summary-row close-row-total">
                        <span class="close-row-label">Saldo final</span>
                        <span class="close-row-value positive" id="close-saldo-final">—</span>
                    </div>
                </div>

            </div>

            <div class="close-actions">
                <button id="btn-confirmar-fechamento" class="btn btn-fechar" disabled>
                    Confirmar Fechamento
                </button>
                <button id="btn-cancelar-fechamento" class="btn btn-ghost">
                    Cancelar
                </button>
            </div>

        </div>
    </div>
    `;
}


/* ==========================================================================
   pages/payment.js
   ========================================================================== */

/**
 * @param {number} valorTotal  — valor já calculado pelo CheckoutPanelController
 */
export function paymentPage(valorTotal = 0) {
    const fmt = (v) => parseFloat(v).toFixed(2);
    const total = fmt(valorTotal);

    return `
    <div class="page-dark">
        <div class="pay-panel">

            <div class="pay-header">
                <p class="pay-label">Total a pagar</p>
                <p class="pay-total"><span>R$</span>${total}</p>
            </div>

            <div class="pay-body">

                <div>
                    <p class="section-title">Forma de pagamento</p>
                    <div class="methods-grid">

                        <label class="method-card">
                            <input type="radio" name="forma_pagamento" value="dinheiro">
                            <span class="method-label">
                                <span class="method-icon">💵</span>
                                <span class="method-name">Dinheiro</span>
                            </span>
                        </label>

                        <label class="method-card">
                            <input type="radio" name="forma_pagamento" value="credito">
                            <span class="method-label">
                                <span class="method-icon">💳</span>
                                <span class="method-name">Crédito</span>
                            </span>
                        </label>

                        <label class="method-card">
                            <input type="radio" name="forma_pagamento" value="debito">
                            <span class="method-label">
                                <span class="method-icon">🏧</span>
                                <span class="method-name">Débito</span>
                            </span>
                        </label>

                        <label class="method-card">
                            <input type="radio" name="forma_pagamento" value="pix">
                            <span class="method-label">
                                <span class="method-icon">⚡</span>
                                <span class="method-name">Pix</span>
                            </span>
                        </label>

                    </div>
                </div>

                <div class="conditional-field" id="field-troco">
                    <label class="field-label" for="valor-recebido">Valor recebido</label>
                    <input class="field-input" type="number" id="valor-recebido"
                           placeholder="0,00" min="0" step="0.01">
                    <div class="troco-display">
                        <span class="troco-label">Troco</span>
                        <span class="troco-valor" id="troco-calculado">R$ 0,00</span>
                    </div>
                </div>

                <div class="conditional-field" id="field-parcelas">
                    <label class="field-label" for="parcelas-select">Parcelamento</label>
                    <select class="parcelas-select" id="parcelas-select">
                        <option value="1">1x de R$ ${total} (sem juros)</option>
                        <option value="2">2x de R$ ${fmt(valorTotal / 2)} (sem juros)</option>
                        <option value="3">3x de R$ ${fmt(valorTotal / 3)} (sem juros)</option>
                        <option value="4">4x de R$ ${fmt(valorTotal / 4)} (sem juros)</option>
                        <option value="5">5x de R$ ${fmt(valorTotal / 5)} (sem juros)</option>
                        <option value="6">6x de R$ ${fmt(valorTotal / 6)} (sem juros)</option>
                    </select>
                </div>

                <div class="pay-actions">
                    <button class="btn-confirmar" id="btn-confirmar-pagamento" disabled>
                        Confirmar pagamento
                    </button>
                    <button class="btn-cancelar" id="btn-cancelar-pagamento">
                        Cancelar
                    </button>
                </div>

            </div>
        </div>
    </div>
    `;
}