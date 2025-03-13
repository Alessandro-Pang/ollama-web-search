/*
 * @Author: zi.yang
 * @Date: 2025-02-11 09:37:59
 * @LastEditors: zi.yang
 * @LastEditTime: 2025-03-11 17:54:56
 * @Description:  Google 自定义搜索 API 封装
 * @FilePath: /ollama-web-search/src/search.js
 */
import axios from 'axios';

import { createLogger } from './utils.js';

const logger = createLogger('search');

/**
 * 使用自定义搜索 API 进行搜索
 *
 * @param {string} query 搜索关键词
 * @returns {Promise<Object|null>} 返回搜索结果的数据，失败返回 null
 */
export async function searchGoogle(query) {
  if (!query || typeof query !== 'string') {
    logger.error("searchGoogle: 无效的搜索关键词");
    return null;
  }

  try {
    const response = await axios.get('http://127.0.0.1:8080/search', {
      params: {
        q: query,
        format: 'json',
      },
    });

    if (!response.data || !response.data.results) {
      return null;
    }

    response.data.results = response.data.results.splice(0, 10)
    return response.data;
  } catch (error) {
    logger.error("searchGoogle: 搜索请求失败", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    return null;
  }
}
