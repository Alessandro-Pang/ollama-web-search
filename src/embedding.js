/*
 * @Author: zi.yang
 * @Date: 2025-02-12 08:44:55
 * @LastEditors: zi.yang
 * @LastEditTime: 2025-02-12 08:45:25
 * @Description: 
 * @FilePath: /ollama-web-search/src/embedding.js
 */
import { pipeline } from '@huggingface/transformers';

/**
 * 将文本转换为词向量
 * @param {string} text - 输入文本
 * @returns {number[]} - 词向量
 */
export async function getTextEmbedding(text) {
  const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  const output = await extractor(text, { pooling: 'mean', normalize: true });
  return output.data;
}
