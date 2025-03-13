/*
 * @Author: zi.yang
 * @Date: 2025-03-12 22:05:00
 * @LastEditors: zi.yang
 * @Description: Chat UI 组件
 */

'use client'

import { useChat } from '@ai-sdk/react'
import { useState, useRef, useEffect } from 'react'

export default function Chat() {
  const [isLoading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
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

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true)
    handleSubmit(e)
  }

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto h-[80vh] border border-gray-200 rounded-lg shadow-sm">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 rounded-t-lg bg-gray-50">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-center text-gray-500">
            <div className="max-w-md p-6 bg-white rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold mb-4 text-blue-600">Ollama Web Search</h2>
              <p className="text-lg mb-4">输入您的问题，我将通过网络搜索为您提供答案</p>
              <div className="text-sm text-gray-500 mt-4">
                <p>示例问题：</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>人工智能的发展历史是怎样的？</li>
                  <li>全球变暖的主要原因是什么？</li>
                  <li>量子计算机的工作原理是什么？</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-gray-200 shadow-sm'
              }`}
            >
              <div className="flex items-center mb-1">
                <div className="font-medium text-xs opacity-75">
                  {message.role === 'user' ? '您' : 'AI 助手'}
                </div>
              </div>
              <div className="whitespace-pre-wrap">{message.content}</div>
            </div>
          </div>
        ))}
        
        {/* Error message */}
        {error && (
          <div className="flex justify-center">
            <div className="max-w-[80%] rounded-lg p-4 bg-red-50 border border-red-200 text-red-600">
              <p className="text-sm">出错了：{error.message || '请稍后再试'}</p>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />

        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg p-4 bg-white border border-gray-200 shadow-sm">
              <div className="flex items-center mb-1">
                <div className="font-medium text-xs opacity-75">AI 助手</div>
              </div>
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={onSubmit} className="flex items-center p-3 bg-white rounded-b-lg border-t">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="输入您的问题..."
          className="flex-1 p-3 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-r-lg disabled:bg-blue-300 transition-colors"
        >
          {isLoading ? (
            <span className="animate-spin inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <span>发送</span>
          )}
        </button>
      </form>
    </div>
  )
}
