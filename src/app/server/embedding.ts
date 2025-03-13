/*
 * @Author: zi.yang
 * @Date: 2025-02-12 08:44:55
 * @LastEditors: zi.yang
 * @LastEditTime: 2025-03-13 09:40:00
 * @Description: 通过大模型将内容转换为向量
 * @FilePath: /ollama-web-search/src/app/server/embedding.ts
 */

import { env, pipeline, PipelineType } from '@huggingface/transformers';
import { createLogger } from './utils';

// 创建日志实例
const logger = createLogger('embedding');

// 配置环境变量
if (process.env.HUGGING_FACE_MIRROR) {
  env.remoteHost = process.env.HUGGING_FACE_MIRROR;
} else {
  env.remoteHost = 'https://hf-mirror.com';
}

// 模型配置
const MODEL_CONFIG = {
  MODEL_NAME: 'sentence-transformers/all-MiniLM-L6-v2',
  PIPELINE_TYPE: 'feature-extraction' as PipelineType,
  POOLING: 'mean' as 'mean' | 'cls' | 'none'
};

/**
 * 提取器的输出类型
 */
type ExtractorOutput = {
  data: number[];
  [key: string]: unknown;
}

/**
 * 将文本转换为词向量
 * @param text - 输入文本
 * @returns 词向量数组，失败返回空数组
 */
export async function getTextEmbedding(text: string): Promise<number[]> {
  if (!text || typeof text !== 'string') {
    logger.error('getTextEmbedding: 无效的输入文本');
    return [];
  }
  
  try {
    const extractor = await pipeline(
      MODEL_CONFIG.PIPELINE_TYPE, 
      MODEL_CONFIG.MODEL_NAME
    );
    // @ts-expect-error 暂时取消类型检查
    const rawOutput = await extractor(text);
    const output = rawOutput as unknown as ExtractorOutput;
    return output.data;
  } catch (error) {
    logger.error('getTextEmbedding: 向量提取失败', error);
    return [];
  }
}
