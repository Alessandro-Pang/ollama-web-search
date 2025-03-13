import { createDeepSeek } from '@ai-sdk/deepseek'
import { createOpenAI } from '@ai-sdk/openai'
import { createOllama } from 'ollama-ai-provider'

export const AIProviderType = {
  OLLAMA: 'ollama',
  OPENAI: 'openai',
  DEEPSEEK: 'deepseek',
}

export const AIProviderFactories = {
  [AIProviderType.OLLAMA]: createOllama,
  [AIProviderType.OPENAI]: createOpenAI,
  [AIProviderType.DEEPSEEK]: createDeepSeek,
}

export class AIProviderFactory {
  /**
   * 创建 AI Provider
   * @param {string} providerType - AI Provider 类型
   * @param {Object} config - AI Provider 配置
   * @returns {Object} - AI Provider 实例
   */
  static createProvider(providerType, config) {
    const factory = AIProviderFactories[providerType]

    if (!factory) {
      throw new Error(`不支持的 AI Provider 类型: ${providerType}`)
    }

    return factory({
      baseURL: config.baseURL || undefined,
      apiKey: config.apiKey || undefined,
    })
  }
}
