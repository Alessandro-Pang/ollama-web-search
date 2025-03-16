/*
 * @Author: zi.yang
 * @Date: 2025-03-12 22:05:00
 * @LastEditors: zi.yang
 * @Description: Chat UI 组件
 */

'use client';

import { useEffect, useRef, useState } from 'react';

import MarkdownIt from 'markdown-it';

import { useChat } from '@ai-sdk/react';

import {
  IconBrain,
  IconGlobe,
  IconSearch,
  IconSend,
  IconSettings,
  IconUser,
} from './icons';
import Settings, { SettingsData } from './settings';

const markdown = new MarkdownIt();

interface ChatProps {
  sessionTitle?: string;
}

export default function Chat({ sessionTitle = '新会话' }: ChatProps) {
  const [isLoading, setLoading] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [useWebSearch, setUseWebSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [settings, setSettings] = useState<SettingsData>({
    modelType: 'ollama',
    model: 'llama3',
    apiUrl: 'http://localhost:11434/api',
    apiKey: '',
  });

  const { messages, input, handleInputChange, handleSubmit, error } = useChat({
    onResponse: () => {
      setLoading(false);
    },
    body: {
      useWebSearch: useWebSearch,
    },
  });

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(
        inputRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [input]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    setLoading(true);
    handleSubmit(e);
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!input.trim() || isLoading) return;
      setLoading(true);
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  const handleSaveSettings = (newSettings: SettingsData) => {
    setSettings(newSettings);
    // 这里可以添加保存设置到本地存储或发送到服务器的逻辑
    console.log('Settings saved:', newSettings);
  };

  return (
    <div
      className='flex flex-col w-full h-screen overflow-hidden'
      style={{
        backgroundColor: 'var(--card)',
        position: 'relative',
      }}
    >
      {/* Chat header */}
      <div
        className='p-4 flex items-center justify-between border-b sticky top-0 z-10 bg-card'
        style={{ borderColor: 'var(--card-border)', height: '64px' }}
      >
        <div className='flex items-center gap-2'>
          <div
            className='w-8 h-8 rounded-full flex items-center justify-center'
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <IconBrain className='w-5 h-5 text-white' />
          </div>
          <h2 className='font-medium truncate max-w-[200px]'>{sessionTitle}</h2>
        </div>
        <button
          onClick={() => setSettingsOpen(true)}
          className='p-2 rounded-full hover:bg-opacity-10 transition-colors'
          style={{ backgroundColor: 'var(--muted)' }}
          title='设置'
        >
          <IconSettings className='w-5 h-5' />
        </button>
      </div>

      {/* Settings modal */}
      <Settings
        isOpen={isSettingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSave={handleSaveSettings}
        initialSettings={settings}
      />

      {/* Chat messages */}
      <div
        className='overflow-y-auto p-4 md:p-6'
        style={{
          backgroundColor: 'var(--muted)',
          height: 'calc(100vh - 64px)',
        }}
      >
        {messages.length === 0 ? (
          <div
            className='flex items-center justify-center'
            style={{ height: 'calc(100% - 130px)' }}
          >
            <div
              className='max-w-md p-6 rounded-xl animate-fade-in message-bubble'
              style={{
                backgroundColor: 'var(--card)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                border: '1px solid var(--card-border)',
              }}
            >
              <div className='flex items-center gap-3 mb-4'>
                <div
                  className='w-10 h-10 rounded-full flex items-center justify-center'
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  <IconSearch className='w-6 h-6 text-white' />
                </div>
                <h2
                  className='text-xl font-bold'
                  style={{ color: 'var(--primary)' }}
                >
                  LLM Web Search
                </h2>
              </div>

              <p
                className='text-lg mb-6'
                style={{ color: 'var(--card-foreground)' }}
              >
                输入您的问题，我将通过网络搜索为您提供答案
              </p>

              <div style={{ color: 'var(--muted-foreground)' }}>
                <p className='font-medium mb-2'>示例问题：</p>
                <ul className='space-y-2'>
                  {[
                    '人工智能的发展历史是怎样的？',
                    '全球变暖的主要原因是什么？',
                    '量子计算机的工作原理是什么？',
                    '最新的AI研究进展有哪些？',
                  ].map((question, index) => (
                    <li
                      key={index}
                      className='flex items-start gap-2 p-2 rounded-lg cursor-pointer hover:bg-opacity-50 transition-colors'
                      style={{ backgroundColor: 'var(--muted)' }}
                      onClick={() => {
                        handleInputChange({
                          target: { value: question },
                        } as React.ChangeEvent<HTMLTextAreaElement>);
                        if (inputRef.current) {
                          inputRef.current.focus();
                        }
                      }}
                    >
                      <span className='text-sm'>{question}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div
            className='space-y-6 overflow-auto'
            style={{ height: 'calc(100% - 130px)' }}
          >
            {messages.map((message) => {
              const isUser = message.role === 'user';
              return (
                <div
                  key={message.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className='flex items-start gap-3 max-w-[85%]'>
                    {!isUser && (
                      <div
                        className='w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1'
                        style={{ backgroundColor: 'var(--primary)' }}
                      >
                        <IconBrain className='w-5 h-5 text-white' />
                      </div>
                    )}

                    <div
                      className='message-bubble'
                      style={{
                        backgroundColor: isUser
                          ? 'var(--primary)'
                          : 'var(--card)',
                        color: isUser
                          ? 'var(--primary-foreground)'
                          : 'var(--card-foreground)',
                        border: isUser
                          ? 'none'
                          : '1px solid var(--card-border)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                        borderTopLeftRadius: !isUser ? '0' : undefined,
                        borderTopRightRadius: isUser ? '0' : undefined,
                      }}
                    >
                      <div
                        dangerouslySetInnerHTML={{
                          __html: markdown.render(message.content),
                        }}
                      ></div>
                    </div>

                    {isUser && (
                      <div className='w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1 bg-gray-200'>
                        <IconUser
                          className='w-5 h-5'
                          style={{ color: 'var(--muted-foreground)' }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Error message */}
            {error && (
              <div className='flex justify-center animate-fade-in'>
                <div
                  className='rounded-lg p-4 max-w-[80%]'
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    color: '#ef4444',
                  }}
                >
                  <p className='text-sm flex items-center gap-2'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      width='16'
                      height='16'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    >
                      <circle cx='12' cy='12' r='10'></circle>
                      <line x1='12' y1='8' x2='12' y2='12'></line>
                      <line x1='12' y1='16' x2='12.01' y2='16'></line>
                    </svg>
                    出错了：{error.message || '请稍后再试'}
                  </p>
                </div>
              </div>
            )}

            {/* Loading indicator */}
            {isLoading && (
              <div className='flex justify-start animate-fade-in'>
                <div className='flex items-start gap-3 max-w-[85%]'>
                  <div
                    className='w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1'
                    style={{ backgroundColor: 'var(--primary)' }}
                  >
                    <IconBrain className='w-5 h-5 text-white' />
                  </div>

                  <div
                    className='message-bubble'
                    style={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--card-border)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                      borderTopLeftRadius: '0',
                    }}
                  >
                    <div className='flex items-center gap-1.5'>
                      <div
                        className='w-2 h-2 rounded-full animate-pulse'
                        style={{ backgroundColor: 'var(--primary)' }}
                      ></div>
                      <div
                        className='w-2 h-2 rounded-full animate-pulse delay-150'
                        style={{
                          backgroundColor: 'var(--primary)',
                          animationDelay: '0.15s',
                        }}
                      ></div>
                      <div
                        className='w-2 h-2 rounded-full animate-pulse delay-300'
                        style={{
                          backgroundColor: 'var(--primary)',
                          animationDelay: '0.3s',
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Floating input area */}
        <div
          className='bottom-8 transform z-20 w-full max-w-2xl mx-auto my-0'
          style={{ background: 'var(--card)' }}
        >
          <form
            onSubmit={onSubmit}
            className='flex flex-col bg-card rounded-lg shadow-lg border'
            style={{ borderColor: 'var(--card-border)' }}
          >
            <div className='flex items-center gap-2 p-3'>
              <div className='relative flex-1'>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder='输入您的问题...'
                  rows={1}
                  className='w-full p-2 pr-20 resize-none overflow-hidden rounded-lg outline-none'
                  style={{
                    backgroundColor: 'var(--muted)',
                    color: 'var(--card-foreground)',
                    maxHeight: '120px',
                    minHeight: '40px',
                    border: '1px solid var(--input-border)',
                  }}
                  disabled={isLoading}
                />
                <div className='absolute right-2 bottom-3 flex items-center space-x-2'>
                  <button
                    type='button'
                    onClick={() => setUseWebSearch(!useWebSearch)}
                    className={`p-1.5 rounded-md transition-colors cursor-pointer`}
                    style={{color: useWebSearch? 'var(--primary)' : 'var(--foreground)',}}
                    title={useWebSearch ? '已启用联网搜索' : '点击启用联网搜索'}
                  >
                    <IconGlobe className='w-4 h-4' />
                  </button>
                  <button
                    type='submit'
                    disabled={isLoading || !input.trim()}
                    className='p-1.5 rounded-md transition-colors cursor-pointer'
                    style={{
                      backgroundColor: input.trim()
                        ? 'var(--primary)'
                        : 'var(--muted-foreground)',
                      color: 'white',
                      opacity: input.trim() ? 1 : 0.5,
                    }}
                  >
                    {isLoading ? (
                      <div
                        className='w-4 h-4 rounded-full border-2 border-t-transparent animate-spin'
                        style={{ borderColor: 'white transparent white white' }}
                      />
                    ) : (
                      <IconSend className='w-4 h-4' />
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div
              className='px-4 py-2 text-xs flex flex-col md:flex-row justify-between items-center border-t'
              style={{
                borderColor: 'var(--card-border)',
                color: 'var(--muted-foreground)',
              }}
            >
              <div className='mb-1 md:mb-0 flex items-center'>
                <span
                  className={`inline-block w-2 h-2 rounded-full mr-2 ${
                    useWebSearch ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                ></span>
                {useWebSearch ? '已启用联网搜索' : '未启用联网搜索'}
              </div>
              <div className='flex items-center gap-2'>
                <span>© {new Date().getFullYear()} Alessandro-Pang</span>
                <span>•</span>
                <a
                  href='https://github.com/Alessandro-Pang/ollama-web-search'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='hover:underline transition-colors'
                  style={{ color: 'var(--primary)' }}
                >
                  GitHub
                </a>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
