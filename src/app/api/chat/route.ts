/*
 * @Author: zi.yang
 * @Date: 2025-03-12 22:06:00
 * @LastEditors: zi.yang
 * @Description: Chat API 路由
 */

import { Message, generateText, streamText, ProviderV1 } from 'ai'
import { AIProviderFactory, AIProviderType } from '../../server/ai-provider'
import { queryCollectionByText, splitAndStoreInChroma } from '../../server/chromadb.js'
import { fetchWebContent } from '../../server/scraping.js'
import { searchGoogle } from '../../server/search.js'

type SearchResult = {
  url: string
  title?: string
  snippet?: string
  content?: string
}

type ChromaQueryResult = {
  ids: string[][]
  embeddings: number[][]
  documents: string[][]
  metadatas: Record<string, unknown>[][]
  distances: number[][]
}

interface ChatRequest {
  messages: Message[]
}

// 获取所有页面的内容
async function getAllPageContent(items: SearchResult[]): Promise<SearchResult[]> {
  const allRequest = items.map(({ url }) => fetchWebContent(url))
  return new Promise((resolve) => {
    Promise.allSettled(allRequest).then((results) => {
      const fulfilledResults = results.filter(
        (result): result is PromiseFulfilledResult<string> => 
          result.status === 'fulfilled' && Boolean(result.value)
      )
      resolve(fulfilledResults.map(({ value }, idx) => ({ ...items[idx], content: value })))
    })
  })
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json() as ChatRequest
    const lastMessage = messages[messages.length - 1].content
    
    // 创建 AI Provider
    const provider = AIProviderFactory.createProvider(
      process.env.AI_PROVIDER_TYPE || AIProviderType.OLLAMA,
      {
        baseURL: process.env.AI_PROVIDER_BASE_URL,
        apiKey: process.env.AI_PROVIDER_API_KEY,
      }
    ) as ProviderV1

    // 生成搜索关键词
    const questionPrompt = `请严格基于以下用户提问的核心语义，提炼出3-5个精准的Google搜索关键词。
    
要求：
1. 关键词必须完全来自原句内容，禁止添加任何外部信息
2. 保持原始语义的完整性，核心术语不得拆分或重组
3. 用英文半角加号连接（例：量子计算+应用场景+技术难点）
4. 输出仅返回关键词组合，不加任何说明
5. 输出的关键词使用同一语言，不要中英混杂

输入内容：${lastMessage}

（示例：
用户输入：如何解决量子计算机的散热问题
正确输出：量子计算机+散热问题+解决方案）`

    const {text: searchPrompt} = await generateText({
      model: provider(process.env.AI_MODEL_NAME),
      prompt: questionPrompt
    })
    
    const search = searchPrompt.trim().split('\n').pop() || ''
    
    // 进行 Google 搜索
    const searchResult = await searchGoogle(search)
    if (!searchResult || typeof searchResult !== 'object' || !('results' in searchResult) || 
        !Array.isArray(searchResult.results) || searchResult.results.length === 0) {
      throw new Error('未找到相关搜索结果')
    }
    
    const results = await getAllPageContent(searchResult.results as SearchResult[])

    // 存储数据到 ChromaDB
    await splitAndStoreInChroma(results)
    
    // 从 ChromaDB 查询相关数据
    const data = await queryCollectionByText([search.replaceAll('+', ' ')]) as ChromaQueryResult
    
    if (!data || !data.documents || !data.documents[0] || data.documents[0].length === 0) {
      throw new Error('未从 ChromaDB 找到相关数据')
    }
    
    const documents = data.documents[0]
    
    // 生成回答
    const answerPrompt = `基于以下可信来源回答问题：
${documents.join('\n')}

请遵循：
1. 使用中文回答
2. 标注引用来源
3. 当信息冲突时，优先采用多个来源共同支持的信息
4. 如果信息不足请明确说明

问题：${lastMessage}
答案：`

    const answer = await streamText({
      model: provider(process.env.AI_MODEL_NAME),
      prompt: answerPrompt
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
