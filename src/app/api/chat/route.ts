/*
 * @Author: zi.yang
 * @Date: 2025-03-12 22:06:00
 * @LastEditors: zi.yang
 * @Description: Chat API 路由
 */
import { Message, generateText, streamText } from 'ai'
import { AIProviderFactoryClass, AIProvider } from '../../server/ai-provider'
import { queryCollectionByText, splitAndStoreInChroma } from '../../server/chromadb'
import { fetchWebContent } from '../../server/scraping'
import { webSearch } from '../../server/search'

/**
 * 搜索结果类型
 */
type SearchResult = {
  url: string
  title?: string
  snippet?: string
  content?: string
}

/**
 * 网页内容类型，与 ChromaDB 兼容
 */
interface WebPage {
  url: string
  title?: string
  link: string
  content: string
}

/**
 * 嵌入向量类型
 */
interface Embedding {
  [key: string]: number
}

/**
 * 多个嵌入向量类型
 */
interface Embeddings {
  [key: string]: Embedding
}

/**
 * ChromaDB 查询结果类型
 */
interface ChromaQueryResult {
  ids: string[][]
  embeddings: number[][]
  documents: string[][]
  metadatas: Record<string, unknown>[][]
  distances: number[][]
}

/**
 * ChromaDB 查询响应类型
 * 这是从 ChromaDB 实际返回的类型
 */
interface ChromaQueryResponse {
  ids: string[][]
  embeddings: Embeddings[] | null
  documents: string[][]
  metadatas: Record<string, unknown>[][]
  distances: number[][]
}

interface ChatRequest {
  messages: Message[]
}

/**
 * 获取所有页面的内容
 * @param items - 搜索结果数组
 * @returns 带有内容的搜索结果数组
 */
async function getAllPageContent(items: SearchResult[]): Promise<WebPage[]> {
  const allRequest = items.map(({ url }) => fetchWebContent(url))
  
  return new Promise((resolve) => {
    Promise.allSettled(allRequest).then((results) => {
      // 过滤成功的结果
      const fulfilledResults = results.filter(
        (result): result is PromiseFulfilledResult<string | null> => 
          result.status === 'fulfilled' && Boolean(result.value)
      )
      
      // 构建 WebPage 对象数组
      const webPages = fulfilledResults.map(({ value }, idx) => {
        const item = items[idx];
        return {
          url: item.url,
          title: item.title || '',
          link: item.url,
          content: value as string // 已经通过 Boolean 检查确保不为 null
        };
      });
      
      resolve(webPages);
    })
  })
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json() as ChatRequest
    const lastMessage = messages.at(-1)?.content

    if(!process.env.AI_PROVIDER_TYPE) {
      throw new Error('AI_PROVIDER_TYPE is not defined')
    }
    
    // 创建 AI Provider
    const provider = AIProviderFactoryClass.createProvider(process.env.AI_PROVIDER_TYPE,
      {
        baseURL: process.env.AI_PROVIDER_BASE_URL,
        apiKey: process.env.AI_PROVIDER_API_KEY,
      }
    ) as AIProvider

    // 生成搜索关键词
    const questionPrompt = `请严格基于以下用户提问的核心语义，提炼出3-5个精准的Google搜索关键词。
    
要求：
1. 关键词必须完全来自原句内容，禁止添加任何外部信息
2. 保持原始语义的完整性，核心术语不得拆分或重组
3. 用英文半角加号连接（例：量子计算+应用场景+技术难点）
4. 输出仅返回关键词组合，不加任何说明
5. 输出的关键词使用同一语言，不要中英混杂

（示例：
用户输入：如何解决量子计算机的散热问题
正确输出：量子计算机+散热问题+解决方案）`

    const {text: searchPrompt} = await generateText({
      model: provider(process.env.AI_MODEL_NAME as string),
      system: questionPrompt,
      prompt: lastMessage
    })
    
    const search = searchPrompt.trim().split('\n').pop() || ''
    
    // 进行搜索
    const searchResult = await webSearch(search)
    if (!searchResult || typeof searchResult !== 'object' || !('results' in searchResult) || 
        !Array.isArray(searchResult.results) || searchResult.results.length === 0) {
      throw new Error('未找到相关搜索结果')
    }
    
    const results = await getAllPageContent(searchResult.results as SearchResult[])

    // 存储数据到 ChromaDB
    await splitAndStoreInChroma(results)
    
    // 从 ChromaDB 查询相关数据
    const queryResponse = await queryCollectionByText([search.replaceAll('+', ' ')]) as ChromaQueryResponse
    
    // 安全地处理嵌入向量数据
    let processedEmbeddings: number[][] = []
    if (queryResponse.embeddings && queryResponse.embeddings.length > 0) {
      try {
        // 尝试将复杂的嵌入向量结构转换为简单的数字数组
        processedEmbeddings = queryResponse.embeddings.map(embedding => {
          const firstKey = Object.keys(embedding)[0]
          const values = Object.values(embedding[firstKey])
          return values.map(v => typeof v === 'number' ? v : 0)
        })
      } catch (error) {
        console.warn('Failed to process embeddings:', error)
        processedEmbeddings = []
      }
    }
    
    // 将响应数据转换为我们需要的类型
    const data = {
      ids: queryResponse.ids,
      embeddings: processedEmbeddings,
      documents: queryResponse.documents,
      metadatas: queryResponse.metadatas,
      distances: queryResponse.distances
    } as unknown as ChromaQueryResult
    
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

答案：`

    const answer = await streamText({
      model: provider(process.env.AI_MODEL_NAME as string),
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
