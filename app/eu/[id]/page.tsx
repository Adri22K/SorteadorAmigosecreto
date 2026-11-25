import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ResultView from '@/components/ResultView';

interface PageProps {
  params: { id: string };
}

export default function ResultadoPage({ params }: PageProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <ResultView participantId={params.id} />
      </main>
      <Footer />
    </div>
  );
}
