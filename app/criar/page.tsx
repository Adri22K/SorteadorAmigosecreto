import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CreateGroupFlow from '@/components/CreateGroupFlow';

export const metadata = {
  title: 'Criar grupo — Meu Amigo Fraudes',
};

export default function CriarPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <CreateGroupFlow />
      </main>
      <Footer />
    </div>
  );
}
