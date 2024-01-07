import styles from "./page.module.css";

function Card({
  className,
  title,
  children,
  href,
}: {
  className?: string;
  title: string;
  children: React.ReactNode;
  href: string;
}): JSX.Element {
  return (
    <a
      className={className}
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      <h2>
        {title} <span>-&gt;</span>
      </h2>
      <p>{children}</p>
    </a>
  );
}

function Gradient({
  conic,
  className,
  small,
}: {
  small?: boolean;
  conic?: boolean;
  className?: string;
}): JSX.Element {
  return (
    <span
      className={[
        styles.gradient,
        conic ? styles.glowConic : undefined,
        small ? styles.gradientSmall : styles.gradientLarge,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}

const LINKS = [
  {
    title: "Docs",
    href: "/api/index.html",
    description: "Find in-depth information about Cobuild JavaScript SDK.",
  },
  {
    title: "Repo",
    href: "https://github.com/doitian/ckb-cobuild-js",
    description: "Join the community and contribute.",
  },
  {
    title: "Contracts",
    href: "https://github.com/cryptape/ckb-transaction-cobuild-poc/tree/main",
    description:
      "Use the library to develop CKB scripts that support Cobuild protocol.",
  },
  {
    title: "Demo",
    href: "https://github.com/doitian/ckb-dao-cobuild-poc",
    description: "A demo showcasing the management of DAO deposits",
  },
];

export default function Page(): JSX.Element {
  return (
    <main className={styles.main}>
      <div className={styles.description}></div>

      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.logos}>
            <div className={styles.logoGradientContainer}>
              <Gradient className={styles.logoGradient} conic small />
            </div>
          </div>
          <Gradient className={styles.backgroundGradient} conic />
          <div className={styles.turborepoWordmarkContainer}>
            <h1>CKB Cobuild</h1>
          </div>
        </div>
      </div>

      <div className={styles.grid}>
        {LINKS.map(({ title, href, description }) => (
          <Card className={styles.card} href={href} key={title} title={title}>
            {description}
          </Card>
        ))}
      </div>
    </main>
  );
}
