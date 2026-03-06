import { AuthForm } from "@/components/auth/AuthForm";

interface LoginPageProps {
  searchParams: {
    error?: string;
  };
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  return <AuthForm mode="login" initialError={searchParams.error} />;
}
