import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { PageContainer } from "@/components/page-container";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center py-12">
      <PageContainer>
        <Card className="mx-auto w-full max-w-md">
          <CardHeader>
            <CardTitle>Entrar</CardTitle>
            <CardDescription>Acesse o painel do organizador.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <LoginForm />
            <p className="text-muted-foreground text-center text-sm">
              Sem conta?{" "}
              <Link
                href="/cadastro"
                className="text-primary font-medium underline"
              >
                Cadastre-se
              </Link>
            </p>
          </CardContent>
        </Card>
      </PageContainer>
    </main>
  );
}
