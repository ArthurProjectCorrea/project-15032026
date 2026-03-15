import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { FieldDescription } from '@/components/ui/field';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden p-0">
            <CardContent className="grid p-0 md:grid-cols-2">
              <div className="flex flex-col justify-center">{children}</div>
              <div className="bg-muted relative hidden md:block">
                <Image
                  src="/auth-doce.jpg"
                  alt="Imagem de fundo"
                  fill
                  className="object-cover dark:brightness-[0.2] dark:grayscale"
                />
              </div>
            </CardContent>
          </Card>
          <FieldDescription className="px-6 text-center">
            Ao clicar em continuar, você concorda com nossos{' '}
            <Link href="/public/terms">Termos de Serviço</Link> e{' '}
            <Link href="/public/privacy">Política de Privacidade</Link>.
          </FieldDescription>
        </div>
      </div>
    </div>
  );
}
