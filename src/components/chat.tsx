/*
 * @Author: zi.yang
 * @Date: 2025-03-12 22:05:00
 * @LastEditors: zi.yang
 * @Description: Chat UI 组件
 */

'use client'

import { useChat } from '@ai-sdk/react'
import { useState, useRef, useEffect } from 'react'
import { IconSend, IconBrain, IconSearch, IconUser } from './icons'
import MarkdownIt from 'markdown-it'

const markdown = new MarkdownIt()

export default function Chat() {
  const [isLoading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { messages, input, handleInputChange, handleSubmit, error } = useChat({
    onResponse: () => {
      setLoading(false)
    },
  })
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Auto-resize textarea based on content
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`
    }
  }, [input])

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    setLoading(true)
    handleSubmit(e)
  }

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!input.trim() || isLoading) return
      setLoading(true)
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>)
    }
  }

  return (
    <div 
      className="flex flex-col w-full mx-auto rounded-xl overflow-hidden" 
      style={{ 
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)', 
        backgroundColor: 'var(--card)',
        border: '1px solid var(--card-border)',
        borderRadius: 'var(--radius)',
        height: 'calc(100vh - 300px)',
      }}
    >
      {/* Chat header */}
      <div 
        className="p-4 flex items-center justify-between border-b" 
        style={{ borderColor: 'var(--card-border)' }}
      >
        <div className="flex items-center gap-2">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center" 
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <IconBrain className="w-5 h-5 text-white" />
          </div>
          <h2 className="font-medium">AI 助手</h2>
        </div>
        <div 
          className="text-xs px-2 py-1 rounded-full" 
          style={{ 
            backgroundColor: 'var(--accent)', 
            color: 'var(--primary-foreground)',
            opacity: 0.8 
          }}
        >
          网络搜索增强
        </div>
      </div>

      {/* Chat messages */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-6" 
        style={{ backgroundColor: 'var(--muted)' }}
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div 
              className="max-w-md p-6 rounded-xl animate-fade-in message-bubble" 
              style={{ 
                backgroundColor: 'var(--card)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                border: '1px solid var(--card-border)'
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center" 
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  <IconSearch className="w-6 h-6 text-white" />
                </div>
                <h2 
                  className="text-xl font-bold" 
                  style={{ color: 'var(--primary)' }}
                >
                  LLM Web Search
                </h2>
              </div>
              
              <p className="text-lg mb-6" style={{ color: 'var(--card-foreground)' }}>
                输入您的问题，我将通过网络搜索为您提供答案
              </p>
              
              <div style={{ color: 'var(--muted-foreground)' }}>
                <p className="font-medium mb-2">示例问题：</p>
                <ul className="space-y-2">
                  {[
                    '人工智能的发展历史是怎样的？',
                    '全球变暖的主要原因是什么？',
                    '量子计算机的工作原理是什么？',
                    '最新的AI研究进展有哪些？'
                  ].map((question, index) => (
                    <li 
                      key={index} 
                      className="flex items-start gap-2 p-2 rounded-lg cursor-pointer hover:bg-opacity-50 transition-colors"
                      style={{ backgroundColor: 'var(--muted)' }}
                      onClick={() => {
                        handleInputChange({ target: { value: question } } as React.ChangeEvent<HTMLTextAreaElement>)
                        if (inputRef.current) {
                          inputRef.current.focus()
                        }
                      }}
                    >
                      <span className="text-sm">{question}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((message) => {
              const isUser = message.role === 'user'
              return (
                <div
                  key={message.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="flex items-start gap-3 max-w-[85%]">
                    {!isUser && (
                      <div 
                        className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1" 
                        style={{ backgroundColor: 'var(--primary)' }}
                      >
                        <IconBrain className="w-5 h-5 text-white" />
                      </div>
                    )}
                    
                    <div 
                      className="message-bubble" 
                      style={{
                        backgroundColor: isUser ? 'var(--primary)' : 'var(--card)',
                        color: isUser ? 'var(--primary-foreground)' : 'var(--card-foreground)',
                        border: isUser ? 'none' : '1px solid var(--card-border)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                        borderTopLeftRadius: !isUser ? '0' : undefined,
                        borderTopRightRadius: isUser ? '0' : undefined,
                      }}
                    >
                      <div dangerouslySetInnerHTML={{ __html: markdown.render(message.content) }}></div>
                    </div>
                    
                    {isUser && (
                      <div 
                        className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1 bg-gray-200" 
                      >
                        <IconUser className="w-5 h-5" style={{ color: 'var(--muted-foreground)' }} />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="flex justify-center animate-fade-in">
            <div 
              className="rounded-lg p-4 max-w-[80%]" 
              style={{ 
                backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#ef4444' 
              }}
            >
              <p className="text-sm flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                出错了：{error.message || '请稍后再试'}
              </p>
            </div>
          </div>
        )}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="flex items-start gap-3 max-w-[85%]">
              <div 
                className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1" 
                style={{ backgroundColor: 'var(--primary)' }}
              >
                <IconBrain className="w-5 h-5 text-white" />
              </div>
              
              <div 
                className="message-bubble" 
                style={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--card-border)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                  borderTopLeftRadius: '0',
                }}
              >
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--primary)' }}></div>
                  <div className="w-2 h-2 rounded-full animate-pulse delay-150" style={{ backgroundColor: 'var(--primary)', animationDelay: '0.15s' }}></div>
                  <div className="w-2 h-2 rounded-full animate-pulse delay-300" style={{ backgroundColor: 'var(--primary)', animationDelay: '0.3s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form 
        onSubmit={onSubmit} 
        className="p-3 border-t" 
        style={{ borderColor: 'var(--card-border)' }}
      >
        <div 
          className="flex items-end gap-2 rounded-lg p-2" 
          style={{ 
            backgroundColor: 'var(--muted)',
            border: '1px solid var(--input-border)',
          }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="输入您的问题..."
            rows={1}
            className="flex-1 p-2 resize-none overflow-hidden bg-transparent outline-none"
            style={{ 
              color: 'var(--card-foreground)',
              maxHeight: '120px',
            }}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex-shrink-0 p-2 rounded-lg transition-colors"
            style={{ 
              backgroundColor: input.trim() ? 'var(--primary)' : 'var(--muted-foreground)', 
              color: 'white',
              opacity: input.trim() ? 1 : 0.5,
            }}
          >
            {isLoading ? (
              <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'white transparent white white' }} />
            ) : (
              <IconSend className="w-5 h-5" />
            )}
          </button>
        </div>
        <div className="mt-2 text-xs text-center" style={{ color: 'var(--muted-foreground)' }}>
          按 Enter 发送消息，按 Shift + Enter 换行
        </div>
      </form>
    </div>
  )
}
