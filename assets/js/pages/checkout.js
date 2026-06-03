// Tela 1: Apenas Abertura de Caixa
export function checkoutOpenPage() {
  return `
    <div class="container">
      <div class="card">
        <h2>Abrir Caixa</h2>
        <p>Informe o valor inicial em dinheiro para abrir o turno.</p>
        <input type="number" id="valor_abertura" placeholder="Valor de Abertura (Ex: 100.00)" step="0.01">
        <button id="btn-abrir-caixa" style="background: #4299e1;">Confirmar Abertura</button>
      </div>

      <button id="btn-logout" style="background: #718096;">Sair</button>
    </div>
  `;
}

// Tela 2: Movimentações e Fechamento
export function checkoutOperationsPage() {
  return `
    <div class="glass-layout">
      <div class="main-actions">
        <div class="glass-card">
          <h2>Registrar Movimentação</h2>
          <input type="number" id="valor" placeholder="Valor (R$)">
          <input type="text" id="descricao" placeholder="Descrição">
          <div class="button-row">
            <button id="btn-entrada" class="btn btn-entrada">Entrada</button>
            <button id="btn-saida" class="btn btn-saida">Saída</button>
          </div>
        </div>
    
        <div class="glass-card">
          <h2>Fechar Caixa</h2>
          <button id="btn-fechar-caixa" class="btn btn-fechar">Fechar Caixa</button>
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


export function checkoutFinalizePage() {
  return `
    <div class="glass-container">
      <div class="glass-card">
        <h2>Finalizar Venda</h2>
        
        <div class="summary-box">
          <p>Total a Pagar:</p>
          <h1 id="total-venda" style="color: #48bb78; margin: 10px 0;">R$ 0,00</h1>
        </div>

        <div class="input-group">
          <label style="color: #cbd5e0;">Forma de Pagamento</label>
          <select id="forma-pagamento" style="width: 100%; padding: 12px; margin: 10px 0; border-radius: 10px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white;">
            <option value="dinheiro" style="color: #333;">Dinheiro</option>
            <option value="pix" style="color: #333;">PIX</option>
            <option value="cartao_debito" style="color: #333;">Cartão de Débito</option>
            <option value="cartao_credito" style="color: #333;">Cartão de Crédito</option>
          </select>
        </div>

        <button id="btn-finalizar-compra" class="btn btn-entrada" style="width: 100%; margin-top: 20px;">Confirmar Pagamento</button>
        <button id="btn-cancelar" class="btn btn-logout" style="width: 100%; margin-top: 10px; border: 1px solid #718096; color: #718096;">Cancelar</button>
      </div>
    </div>
  `;
}