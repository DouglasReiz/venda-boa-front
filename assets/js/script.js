import { ApiClient }                 from './ApiClient/ApiClient.js';
import { AuthService }               from './services/AuthService.js';
import { CheckoutService }           from './services/CheckoutService.js';
import { CaixaAdminService }         from './services/CaixaAdminService.js';
import { GraficoService }            from './services/GraficoService.js';
import { ProductService }            from './services/ProductService.js';
import { UserService }                from './services/UserService.js';

import { AuthController }            from './Controller/AuthController.js';
import { DashboardController }       from './Controller/DashboardController.js';
import { CheckoutOpenController }    from './Controller/CheckoutOpenController.js';
import { CheckoutCloseController }   from './Controller/CheckoutCloseController.js';
import { CheckoutFinalizeController} from './Controller/CheckoutFinalizeController.js';
import { AdminProductsController }   from './Controller/AdminProductsController.js';
import { PdvController }             from './Controller/PdvController.js';
import { StockController }           from './Controller/StockController.js';
import { UsersController }           from './Controller/UsersController.js';
import { TrocarSenhaController }     from './Controller/TrocarSenhaController.js';

import { Router } from './router.js';
import {
    loginPage,
    dashboardPage,
    checkoutOpenPage,
    checkoutClosePage,
    paymentPage,
    trocarSenhaPage,
} from './pages/pages.js';
import { adminProductsPage, pdvPage, stockPage } from './pages/products.js';
import { usersPage } from './pages/users.js';

// ── Infraestrutura ────────────────────────────────────────────────────────────
const api = new ApiClient('https://api.pdvvendaboa.com.br/api');

// ── Serviços ──────────────────────────────────────────────────────────────────
const auth       = new AuthService(api);
const checkout   = new CheckoutService(api);
const caixaAdmin = new CaixaAdminService(api);
const grafico    = new GraficoService(api);
const products   = new ProductService(api);
const users       = new UserService(api);

// ── Controllers ───────────────────────────────────────────────────────────────
const authCtrl        = new AuthController(auth);
const dashCtrl        = new DashboardController(auth, caixaAdmin, grafico);
const openCtrl        = new CheckoutOpenController(auth, checkout);
const closeCtrl       = new CheckoutCloseController(auth, checkout);
const finalizeCtrl    = new CheckoutFinalizeController(auth, checkout);
const adminProdCtrl   = new AdminProductsController(auth, products);
const pdvCtrl         = new PdvController(auth, products, checkout);
const stockCtrl       = new StockController(auth, products);
const usersCtrl        = new UsersController(auth, users);
const trocarSenhaCtrl  = new TrocarSenhaController(auth, api);

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
    .on('/trocar-senha', () => ({ html: trocarSenhaPage(), onMount: () => trocarSenhaCtrl.bind() }))

    .on('/',          () => rotaProtegida(() => dashboardPage(auth), () => dashCtrl.init()))
    .on('/dashboard', () => rotaProtegida(() => dashboardPage(auth), () => dashCtrl.init()))

    .on('/checkout/abrir',   () => rotaProtegida(checkoutOpenPage,       () => openCtrl.bindCheckoutOpen()))
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

    // ── Produtos ──────────────────────────────────────────────────────────────
    .on('/admin/produtos', () => {
        if (!auth.pode('verGerenciarProdutos')) { window.router.navigate('/dashboard'); return { html: '', onMount: () => {} }; }
        return rotaProtegida(adminProductsPage, () => adminProdCtrl.init());
    })
    .on('/pdv',            () => rotaProtegida(pdvPage,           () => pdvCtrl.init()))
    .on('/estoque', () => {
        if (!auth.pode('verControleEstoque')) { window.router.navigate('/dashboard'); return { html: '', onMount: () => {} }; }
        return rotaProtegida(stockPage, () => stockCtrl.init());
    })
    .on('/trocar-senha',   () => ({
        html:    trocarSenhaPage(),
        onMount: () => trocarSenhaCtrl.bindTrocarSenha(),
    }))

    .on('/usuarios', () => {
        if (!auth.pode('verGerenciarUsuarios')) { window.router.navigate('/dashboard'); return { html: '', onMount: () => {} }; }
        return rotaProtegida(
            () => usersPage(auth.isAdminGlobal()),
            () => usersCtrl.init(),
        );
    })

    .start();

window.router = router;
