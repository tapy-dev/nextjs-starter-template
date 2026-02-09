export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-6">
      <main className="text-center space-y-4">
        <h1 className="text-2xl sm:text-3xl font-semibold">
          Hoşgeldin.
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Kodu yapay zeka yazacak ve birazdan burada web siten otomatik olarak gözükecek.
        </p>
      </main>
    </div>
  );
}
