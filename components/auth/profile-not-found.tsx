import { LogoutButton } from '@/components/auth/logout-button';

export function ProfileNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="bg-card rounded-lg border p-8 text-center shadow-sm">
        <h2 className="mb-2 text-xl font-bold">Perfil não encontrado</h2>
        <p className="text-muted-foreground mb-4">
          Ainda não conseguimos carregar os dados do seu perfil. <br />
          Tente atualizar a página em alguns instantes.
        </p>
        <LogoutButton />
      </div>
    </div>
  );
}
