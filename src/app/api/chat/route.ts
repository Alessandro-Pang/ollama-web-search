/*
 * @Author: zi.yang
 * @Date: 2025-03-12 22:06:00
 * @LastEditors: zi.yang
 * @Description: Chat API 路由
 */
import { streamText } from 'ai'
import { createAIProvider, processWithWebSearch, processWithoutWebSearch } from '../../server/chat-service'

interface ChatRequest {
  messages: Message[]
  useWebSearch?: boolean
}

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
}

export async function POST(req: Request) {
  try {
    const { messages, useWebSearch = true } = await req.json() as ChatRequest
    const lastMessage = messages.at(-1)?.content

    if (!lastMessage) {
      throw new Error('No message content provided')
    }
    
    // 创建 AI Provider
    const provider = createAIProvider()
    const modelName = process.env.AI_MODEL_NAME as string

    // 根据是否启用联网搜索选择不同的处理流程
    let answerPrompt: string;
    
    if (useWebSearch) {
      // 使用联网搜索处理聊天
      answerPrompt = await processWithWebSearch(provider, modelName, messages, lastMessage)
    } else {
      // 不使用联网搜索，直接使用模型回答
      answerPrompt = processWithoutWebSearch()
    }

    // 生成回答流
    const answer = await streamText({
      model: provider(modelName),
      system: answerPrompt,
      messages
    })
    
    return answer.toDataStreamResponse();
  } catch (error: unknown) {
    console.error('Chat API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
