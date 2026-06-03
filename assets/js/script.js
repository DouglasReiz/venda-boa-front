import { ApiClient }                  from './ApiClient/ApiClient.js';
import { AuthService }                 from './services/AuthService.js';
import { CheckoutService }             from './services/CheckoutService.js';
import { CaixaAdminService }           from './services/CaixaAdminService.js';
import { GraficoService }              from './services/GraficoService.js';

// Controllers por responsabilidade (SRP)
import { AuthController }              from './Controller/AuthController.js';
import { DashboardController }         from './Controller/DashboardController.js';
import { CheckoutOpenController }      from './Controller/CheckoutOpenController.js';
import { CheckoutPanelController }     from './Controller/CheckoutPanelController.js';
import { CheckoutFinalizeController }  from './Controller/CheckoutFinalizeController.js';

import { Router }          from './router.js';
import { loginPage }       from './pages/login.js';
import { dashboardPage }   from './pages/dashboard.js';
import {
    checkoutOpenPage,
    checkoutOperationsPage,
    checkoutFinalizePage,
} from './pages/checkout.js';

// ─── Infraestrutura ───────────────────────────────────────────────────────────
const api = new ApiClient('http://localhost:8000/api');

// ─── Serviços ─────────────────────────────────────────────────────────────────
const auth       = new AuthService(api);
const checkout   = new CheckoutService(api);
const caixaAdmin = new CaixaAdminService(api);
const grafico    = new GraficoService(api);

// ─── Controllers ─────────────────────────────────────────────────────────────
const authCtrl     = new AuthController(auth);
const dashCtrl     = new DashboardController(caixaAdmin, grafico);
const openCtrl     = new CheckoutOpenController(auth, checkout);
const panelCtrl    = new CheckoutPanelController(auth, checkout);
const finalizeCtrl = new CheckoutFinalizeController(auth, checkout);

// ─── Roteamento ───────────────────────────────────────────────────────────────
const router = new Router();

/**
 * Guarda de autenticação reutilizável.
 * Redireciona para /login se não houver sessão ativa.
 */
function rotaProtegida(page, onMount) {
    if (!auth.isAuthenticated()) {
        router.navigate('/login');
        return { html: '', onMount: () => {} };
    }
    return { html: page(), onMount };
}

router
    .on('/login',    () => ({
        html: loginPage(),
        onMount: () => authCtrl.bindLogin(),
    }))
    .on('/',         () => rotaProtegida(dashboardPage, () => dashCtrl.init()))
    .on('/dashboard',() => rotaProtegida(dashboardPage, () => dashCtrl.init()))

    .on('/checkout/abrir',    () => rotaProtegida(
        checkoutOpenPage,
        () => openCtrl.bindCheckoutOpen(),
    ))
    .on('/checkout/painel',   () => rotaProtegida(
        checkoutOperationsPage,
        () => panelCtrl.bindCheckoutOperations(),
    ))
    .on('/checkout/finalizar', () => rotaProtegida(
        checkoutFinalizePage,
        () => {
            const valorParaPagar = checkout.getValorVenda();
            finalizeCtrl.bindCheckoutFinalizacao(valorParaPagar);
        },
    ))
    .start();

window.router = router;