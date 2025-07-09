import { ReactNode } from 'react';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return <>{children}</>;
} 