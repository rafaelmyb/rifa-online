import Link from "next/link";
import { RegisterForm } from "@/components/register-form";
import { PageContainer } from "@/components/page-container";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CadastroPage() {
  return (
    <main className="flex flex-1 items-center justify-center py-12">
      <PageContainer>
        <Card className="mx-auto w-full max-w-md">
          <CardHeader>
            <CardTitle>Criar conta</CardTitle>
            <CardDescription>
              Cadastro público para acessar o painel e criar suas rifas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RegisterForm />
            <p className="text-muted-foreground text-center text-sm">
              Já tem conta?{" "}
              <Link href="/login" className="text-primary font-medium underline">
                Entrar
              </Link>
            </p>
          </CardContent>
        </Card>
      </PageContainer>
    </main>
  );
}
