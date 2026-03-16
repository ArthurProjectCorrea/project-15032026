export interface BreadcrumbConfigItem {
  label: string;
  href?: string;
}

/**
 * Configuração dos Breadcrumbs.
 * Você pode declarar por:
 * 1. Segmento individual (ex: "clients": "Clientes")
 * 2. Rota completa para um único label (ex: "/admin/clients": "Gerenciar Clientes")
 * 3. Rota completa para uma trilha completa (ex: "/admin/clients/novo": [{ label: "Clientes", href: "/admin/clients" }, { label: "Novo" }])
 */
export const breadcrumbConfig: Record<string, string | BreadcrumbConfigItem[]> =
  {
    // Trilhas completas manuais
    '/admin': [{ label: 'Dashboard' }],
    '/admin/stocks': [{ label: 'Estoque' }],
  };
