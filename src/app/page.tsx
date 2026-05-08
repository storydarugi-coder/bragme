export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-500">
        BragMe · v0
      </p>
      <h1 className="mt-6 max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
        Spill your mess.
        <br />
        <span className="bg-gradient-to-r from-pink-500 via-fuchsia-500 to-orange-400 bg-clip-text text-transparent">
          We&apos;ll find your magic.
        </span>
      </h1>
      <p className="mt-6 max-w-md text-base text-zinc-600 dark:text-zinc-400">
        The form goes here next. For now, project skeleton is live.
      </p>
    </main>
  );
}
