/*
 * @Author: zi.yang
 * @Date: 2025-02-12 08:44:55
 * @LastEditors: zi.yang
 * @LastEditTime: 2025-02-14 16:58:25
 * @Description: 通过大模型将内容转换为向量
 * @FilePath: /ollama-web-search/src/embedding.js
 */
import { env, pipeline } from '@huggingface/transformers';

env.remoteHost = 'https://hf-mirror.com'
/**
 * 将文本转换为词向量
 * @param {string} text - 输入文本
 * @returns {number[]} - 词向量
 */
export async function getTextEmbedding(text) {
  const extractor = await pipeline('feature-extraction', 'sentence-transformers/all-MiniLM-L6-v2');
  const output = await extractor(text, { pooling: 'mean', normalize: true });
  return output.data;
}
