import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import Card from '@/components/Card';

const steps = [
  {
    title: 'Crie o grupo',
    description:
      'Dê um nome ao grupo, defina um valor de sugestão e adicione os participantes da sua lista.',
  },
  {
    title: 'Faça o sorteio',
    description:
      'O sorteio garante que ninguém tire a si mesmo e que todos sejam sorteados exatamente uma vez.',
  },
  {
    title: 'Compartilhe o resultado',
    description:
      'Cada pessoa recebe um link privado para descobrir quem tirou — sem ver o sorteio dos outros.',
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-4 pb-16 pt-14 text-center sm:px-6 sm:pt-20">
          <p className="mb-4 inline-flex items-center gap-2 rounded-pill bg-accent-soft px-4 py-1.5 text-sm font-semibold text-accent-deep shadow-accentSoft">
            Menos trabalho. Mais surpresa.
          </p>
          <h1 className="mx-auto max-w-2xl font-display text-4xl font-bold text-primary sm:text-5xl">
            Seu amigo secreto,{' '}
            <span className="text-accent">organizado em minutos.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted">
            Convide as pessoas, faça o sorteio e entregue os resultados por links
            privados. Simples do começo ao fim.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/criar">
              <Button variant="accent">Criar meu grupo</Button>
            </Link>
            <Link href="#como-funciona">
              <Button variant="soft">Entenda como funciona</Button>
            </Link>
          </div>
        </section>

        <section id="como-funciona" className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
          <div className="mb-8 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-accent">
              Simples do começo ao fim
            </p>
            <h2 className="font-display text-3xl font-bold text-primary">
              Como fazer seu amigo secreto
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((step, i) => (
              <Card key={step.title} className="text-left">
                <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft font-display text-base font-bold text-accent-deep">
                  {i + 1}
                </span>
                <h3 className="mb-2 font-display text-lg font-semibold text-primary">
                  {step.title}
                </h3>
                <p className="text-sm text-muted">{step.description}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
          <Card className="bg-accent-deep text-center text-white sm:p-12">
            <h2 className="font-display text-3xl font-bold">
              Pronto para começar?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-white/85">
              As melhores surpresas começam com um convite.
            </p>
            <div className="mt-7">
              <Link href="/criar">
                <Button variant="accent" className="bg-accent text-white hover:brightness-110">
                  Criar meu grupo
                </Button>
              </Link>
            </div>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
}
