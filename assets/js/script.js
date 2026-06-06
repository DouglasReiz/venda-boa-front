import { ApiClient }                 from './ApiClient/ApiClient.js';
import { AuthService }               from './services/AuthService.js';
import { CheckoutService }           from './services/CheckoutService.js';
import { CaixaAdminService }         from './services/CaixaAdminService.js';
import { GraficoService }            from './services/GraficoService.js';

import { AuthController }            from './Controller/AuthController.js';
import { DashboardController }       from './Controller/DashboardController.js';
import { CheckoutOpenController }    from './Controller/CheckoutOpenController.js';
import { CheckoutPanelController }   from './Controller/CheckoutPanelController.js';
import { CheckoutCloseController }   from './Controller/CheckoutCloseController.js';
import { CheckoutFinalizeController} from './Controller/CheckoutFinalizeController.js';

import { Router } from './router.js';
import {
    loginPage,
    dashboardPage,
    checkoutOpenPage,
    checkoutOperationsPage,
    checkoutClosePage,
    paymentPage,
} from './pages/pages.js';

// ── Infraestrutura ────────────────────────────────────────────────────────────
const api = new ApiClient('http://136.248.105.152/api');

// ── Serviços ──────────────────────────────────────────────────────────────────
const auth       = new AuthService(api);
const checkout   = new CheckoutService(api);
const caixaAdmin = new CaixaAdminService(api);
const grafico    = new GraficoService(api);

// ── Controllers ───────────────────────────────────────────────────────────────
const authCtrl     = new AuthController(auth);
const dashCtrl     = new DashboardController(auth, caixaAdmin, grafico);
const openCtrl     = new CheckoutOpenController(auth, checkout);
const panelCtrl    = new CheckoutPanelController(auth, checkout);
const closeCtrl    = new CheckoutCloseController(auth, checkout);
const finalizeCtrl = new CheckoutFinalizeController(auth, checkout);

// ── Router ────────────────────────────────────────────────────────────────────
const router = new Router();

function rotaProtegida(page, onMount) {
    if (!auth.isAuthenticated()) {
        router.navigate('/login');
        return { html: '', onMount: () => {} };
    }
    return { html: page(), onMount };
}

router
    .on('/login',    () => ({ html: loginPage(), onMount: () => authCtrl.bindLogin() }))

    .on('/',          () => rotaProtegida(dashboardPage, () => dashCtrl.init()))
    .on('/dashboard', () => rotaProtegida(dashboardPage, () => dashCtrl.init()))

    .on('/checkout/abrir',   () => rotaProtegida(checkoutOpenPage,       () => openCtrl.bindCheckoutOpen()))
    .on('/checkout/painel',  () => rotaProtegida(checkoutOperationsPage, () => panelCtrl.bindCheckoutOperations()))
    .on('/checkout/fechar',  () => rotaProtegida(checkoutClosePage,      () => closeCtrl.bindCheckoutClose()))

    .on('/checkout/pagamento', () => {
        if (!auth.isAuthenticated()) {
            router.navigate('/login');
            return { html: '', onMount: () => {} };
        }
        const valor = checkout.getValorVenda();
        return {
            html:    paymentPage(valor),
            onMount: () => finalizeCtrl.bindCheckoutFinalizacao(valor),
        };
    })

    .start();

window.router = router;