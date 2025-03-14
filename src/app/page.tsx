'use client'

import { useState } from 'react'
import Chat from '../components/chat'
import Sidebar from '../components/sidebar'

export interface ChatSession {
  id: string;
  title: string;
  date: string;
  preview: string;
}

export default function Home() {
  const [activeSession, setActiveSession] = useState<ChatSession>({
    id: '1',
    title: '新会话',
    date: new Date().toISOString().split('T')[0],
    preview: '开始一个新的对话...'
  })

  const handleSessionChange = (session: ChatSession) => {
    setActiveSession(session)
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <Sidebar onSessionChange={handleSessionChange} />
      
      {/* Main content area - Chat component */}
      <div className="flex-1 h-full overflow-hidden">
        <Chat sessionTitle={activeSession.title} />
      </div>
    </div>
  );
}
