/*
 * @Author: zi.yang
 * @Date: 2025-03-13
 * @LastEditors: zi.yang
 * @Description: AI Provider 工厂类
 */

import { createDeepSeek } from '@ai-sdk/deepseek';
import { createOpenAI, OpenAIProvider } from '@ai-sdk/openai';
import { createOllama } from 'ollama-ai-provider';

export type AIProvider = OpenAIProvider;

// AI Provider 类型枚举
export enum AIProviderType {
  OLLAMA = 'ollama',
  OPENAI = 'openai',
  DEEPSEEK = 'deepseek',
}

// AI Provider 配置接口
export interface AIProviderConfig {
  baseURL?: string;
  apiKey?: string;
}

// AI Provider 工厂函数类型
type ProviderFactoryFn = (config: AIProviderConfig) => unknown;

// AI Provider 工厂映射
export const AIProviderFactories: Record<AIProviderType, ProviderFactoryFn> = {
  [AIProviderType.OLLAMA]: createOllama,
  [AIProviderType.OPENAI]: createOpenAI,
  [AIProviderType.DEEPSEEK]: createDeepSeek,
};

/**
 * AI Provider 工厂类
 */
export class AIProviderFactoryClass {
  /**
   * 创建 AI Provider
   * @param providerType - AI Provider 类型
   * @param config - AI Provider 配置
   * @returns AI Provider 实例
   */
  static createProvider(providerType: AIProviderType | string, config: AIProviderConfig): unknown {
    const factory = AIProviderFactories[providerType as AIProviderType];

    if (!factory) {
      throw new Error(`不支持的 AI Provider 类型: ${providerType}`);
    }

    return factory({
      baseURL: config.baseURL || undefined,
      apiKey: config.apiKey || undefined,
    });
  }
}
