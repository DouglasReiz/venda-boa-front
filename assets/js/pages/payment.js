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