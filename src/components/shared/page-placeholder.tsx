interface PagePlaceholderProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function PagePlaceholder({
  eyebrow,
  title,
  description,
}: PagePlaceholderProps) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <section className="max-w-xl text-center">
        <p className="text-sm font-semibold text-indigo-600">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-4 text-neutral-600">{description}</p>
      </section>
    </main>
  );
}
