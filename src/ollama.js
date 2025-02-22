/*
 * @Author: zi.yang
 * @Date: 2025-02-11 10:27:42
 * @LastEditors: zi.yang
 * @LastEditTime: 2025-02-14 17:04:16
 * @Description: Ollama AI 生成响应封装
 * @FilePath: /ollama-web-search/src/ollama.js
 */

import { Ollama } from 'ollama';

import { createLogger } from './utils.js';

const logger = createLogger('ollama');

// 配置 Ollama 服务器
const ollama = new Ollama({ host: "http://localhost:11434" });

/**
 * 生成 AI 响应
 *
 * @param {string} prompt 提示内容
 * @param {Object} [params={}] 其他参数（可选）
 * @returns {Promise<string|null>} 生成的响应文本，如果失败则返回 null
 */
export async function generateResponse(prompt, params = {}) {
  if (!prompt || typeof prompt !== 'string') {
    logger.error("generateResponse: 无效的 prompt 输入");
    return null;
  }

  try {
    const response = await ollama.generate({
      prompt,
      model: process.env.MODEL_NAME || 'deepseek-r1:14b',
      stream: false,
      ...params // 允许覆盖默认参数
    });

    return response?.response || null;
  } catch (error) {
    logger.error("generateResponse: 请求失败", error);
    return null;
  }
}

