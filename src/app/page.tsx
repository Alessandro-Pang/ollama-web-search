import Chat from '../components/chat'

export default function Home() {
  return (
    <div className="flex flex-col items-center min-h-screen w-full">
      {/* Header with gradient background */}
      <header 
        className="w-full py-8 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white animate-fade-in"
        style={{ background: 'var(--header-bg)' }}
      >
        <div className="max-w-5xl mx-auto flex flex-col items-center">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-2 tracking-tight">
          LLM Web Search
          </h1>
          <p className="text-center text-indigo-100 text-lg max-w-2xl">
            AI 辅助网络搜索与问答 - 智能、准确、高效
          </p>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 w-full max-w-6xl px-4 py-6 md:py-10 animate-slide-up">
        <Chat />
      </main>
      
      {/* Footer */}
      <footer className="w-full py-6 px-4 border-t" style={{ borderColor: 'var(--card-border)' }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              © {new Date().getFullYear()} Alessandro-Pang
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <a 
              href="https://github.com/Alessandro-Pang/ollama-web-search" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm hover:underline transition-colors"
              style={{ color: 'var(--primary)' }}
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
