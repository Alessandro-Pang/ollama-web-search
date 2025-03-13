import Chat from '../components/chat'

export default function Home() {
  return (
    <div className="flex flex-col items-center min-h-screen p-4 pb-20 gap-6 font-[family-name:var(--font-geist-sans)]">
      <header className="w-full max-w-3xl py-4">
        <h1 className="text-2xl font-bold text-center">Ollama Web Search</h1>
        <p className="text-center text-gray-600">AI 辅助网络搜索与问答</p>
      </header>
      
      <main className="flex-1 w-full">
        <Chat />
      </main>
      
      <footer className="text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Ollama Web Search
      </footer>
    </div>
  );
}
