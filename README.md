# Venda Boa - Ponto de Venda (PDV) Multi-tenant

O **Venda Boa** é um sistema de Ponto de Venda (PDV) robusto e escalável, desenvolvido sob o modelo SaaS (Software as a Service) multi-tenant. O sistema foi projetado para atender múltiplas empresas simultaneamente, assegurando o completo isolamento, privacidade e segurança dos dados de cada cliente (inquilino).

A aplicação adota uma arquitetura desacoplada, utilizando uma API RESTful de alto desempenho no back-end e uma interface de usuário leve, fluida e altamente responsiva no front-end.

---

## 🚀 Tecnologias Utilizadas

### Back-end (API)
*   **PHP 8.x**
*   **Laravel Framework** (Estruturação de rotas RESTful, middlewares de segurança e ORM)
*   **MySQL** (Modelagem relacional e estratégias de isolamento de tenants)

### Front-end
*   **JavaScript Vanilla** (Consumo assíncrono da API, manipulação nativa do DOM e alta performance)
*   **HTML5 / CSS3**

---

## ⚙️ Funcionalidades Principais

*   **Arquitetura Multi-tenant:** Separação rígida e lógica de funcionalidades e acessos por empresa, mitigando qualquer risco de vazamento ou cruzamento de dados.
*   **Controle de Acesso Granular (RBAC):** Sistema de permissões estruturado em níveis de acesso diferenciados para usuários, restringindo telas e ações conforme o perfil profissional.
*   **Gestão de Catálogo Complexo:** Cadastro completo de produtos e sub-produtos, permitindo gerenciar variações e atributos de forma flexível e integrada.
*   **Dashboard Gerencial Analítico:** Painel visual com resumos estratégicos e métricas de vendas, com atualização imediata e automatizada disparada após cada fechamento de caixa.

---

## 📐 Práticas e Padrões de Desenvolvimento

O projeto é guiado por boas práticas de engenharia de software para garantir um ciclo de vida sustentável e escalável:
*   **Princípios SOLID:** Código limpo, desacoplado e preparado para futuras expansões sem quebras de compatibilidade.
*   **Arquitetura MVC / REST:** Divisão clara de responsabilidades entre regras de negócio, persistência de dados e apresentação.
*   **Segurança como Prioridade:** Implementação de autenticação segura para a API, sanitização rigorosa de inputs e proteção contra vulnerabilidades web.

---

## 🛠️ Status do Projeto

O **Venda Boa** encontra-se em **desenvolvimento contínuo**. A roadmap do projeto foca na integração constante de novas funcionalidades operacionais, otimização contínua da experiência do usuário (UX) e auditorias regulares de segurança da informação.