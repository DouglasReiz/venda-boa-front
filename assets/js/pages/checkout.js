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

        <button id="btn-logout" class="btn btn-ghost">Sair</button>
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
                    <button id="btn-logout"        class="btn btn-ghost">Sair</button>
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


/** Tela 3 — Fechamento de caixa (resumo antes de confirmar) */
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