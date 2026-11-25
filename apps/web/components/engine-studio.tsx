import Link from "next/link";
import { engineDemos } from "./engine-demos";
import styles from "./engine-demo.module.css";

export function EngineStudio() {
  return (
    <section className="grid gap-4" aria-labelledby="engine-studio-title">
      <h2 id="engine-studio-title" className="text-2xl font-semibold">Demos jugables</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Object.entries(engineDemos).map(([id, game]) => (
          <Link key={id} href={game.href} className={`${styles.card} ${styles[id]}`}>
            <span className={styles.eyebrow}>{game.engine}</span>
            <h3>{game.title}</h3>
            <p>{game.summary}</p>
            <span className={styles.cardAction}>Jugar demo <span aria-hidden="true">↗</span></span>
          </Link>
        ))}
      </div>
    </section>
  );
}
