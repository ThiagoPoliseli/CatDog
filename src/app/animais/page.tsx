import Image from "next/image";
import { AnimalCatalog } from "@/components/AnimalCatalog";
import { listCatalog } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AnimalsPage() {
  const catalog = await listCatalog();

  return (
    <main className="page">
      <section className="hero">
        <div>
          <h1>Animais para adocao</h1>
          <p>
            Encontre caes e gatos disponiveis, conheca o perfil de cada animal e
            envie uma solicitacao de interesse para a organizacao.
          </p>
        </div>
        <div className="hero-media">
          <Image
            alt="Cao e gato em ambiente domestico"
            fill
            priority
            sizes="(max-width: 900px) 100vw, 42vw"
            src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80"
          />
        </div>
      </section>

      <AnimalCatalog
        animals={catalog.animals}
        breeds={catalog.breeds}
        sizes={catalog.sizes}
        species={catalog.species}
      />
    </main>
  );
}
