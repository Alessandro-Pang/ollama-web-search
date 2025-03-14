'use client'
import React, { useState } from 'react';
import { ChatSession } from '../app/page';

interface SidebarProps {
  onSessionChange: (session: ChatSession) => void;
}

// 示例会话数据
const initialSessions: ChatSession[] = [
  {
    id: '1',
    title: '人工智能的发展历史',
    date: '2025-03-13',
    preview: '人工智能的发展可以追溯到20世纪50年代...'
  },
  {
    id: '2',
    title: '量子计算机原理',
    date: '2025-03-12',
    preview: '量子计算机利用量子力学原理进行计算...'
  },
  {
    id: '3',
    title: '全球变暖的主要原因',
    date: '2025-03-10',
    preview: '全球变暖主要是由人类活动导致的温室气体排放增加...'
  }
];

const Sidebar = ({ onSessionChange }: SidebarProps) => {
  const [sessions, setSessions] = useState<ChatSession[]>(initialSessions);
  const [activeSession, setActiveSession] = useState<string>('1');
  
  // 新建会话
  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: '新会话',
      date: new Date().toISOString().split('T')[0],
      preview: '开始一个新的对话...'
    };
    
    setSessions([newSession, ...sessions]);
    setActiveSession(newSession.id);
    onSessionChange(newSession);
  };
  
  // 删除会话
  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedSessions = sessions.filter(session => session.id !== id);
    setSessions(updatedSessions);
    
    if (activeSession === id && updatedSessions.length > 0) {
      setActiveSession(updatedSessions[0].id);
    }
  };

  return (
    <aside className="w-72 h-full border-r overflow-y-auto hidden md:block" style={{ borderColor: 'var(--card-border)' }}>
      <div className="p-4 border-b" style={{ borderColor: 'var(--card-border)' }}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold" style={{ color: 'var(--primary)' }}>LLM Web Search</h2>
        </div>
      </div>
      
      <div className="p-3">
        <button 
          onClick={createNewSession}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-md text-sm transition-colors"
          style={{ 
            backgroundColor: 'var(--primary)', 
            color: 'var(--primary-foreground)'
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>新建会话</span>
        </button>
      </div>
      
      <div className="px-2 py-1">
        <h3 className="px-3 py-2 text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
          历史会话
        </h3>
        
        <ul className="space-y-1">
          {sessions.map((session) => (
            <li 
              key={session.id}
              onClick={() => {
                setActiveSession(session.id);
                onSessionChange(session);
              }}
              className={`p-3 rounded-md cursor-pointer transition-colors ${activeSession === session.id ? 'bg-opacity-100' : 'hover:bg-opacity-50'}`}
              style={{ 
                backgroundColor: activeSession === session.id ? 'var(--muted)' : 'transparent',
                borderLeft: activeSession === session.id ? '3px solid var(--primary)' : 'none'
              }}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>
                    {session.title}
                  </h4>
                  <p className="text-xs truncate mt-1" style={{ color: 'var(--muted-foreground)' }}>
                    {session.preview}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                    {session.date}
                  </p>
                </div>
                
                <button 
                  onClick={(e) => deleteSession(session.id, e)}
                  className="ml-2 p-1 rounded-full hover:bg-opacity-10 transition-colors"
                  style={{ 
                    backgroundColor: 'var(--muted)', 
                    color: 'var(--muted-foreground)'
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="absolute bottom-0 left-0 w-72 p-3 border-t bg-card" style={{ borderColor: 'var(--card-border)' }}>
        <div className="flex items-center justify-between text-xs" style={{ color: 'var(--muted-foreground)' }}>
          <div className="flex items-center gap-1">
            <span>© {new Date().getFullYear()}</span>
            <a 
              href="https://github.com/Alessandro-Pang/ollama-web-search" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:underline"
              style={{ color: 'var(--primary)' }}
            >
              Alessandro-Pang
            </a>
          </div>
          <span>v1.0.0</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
