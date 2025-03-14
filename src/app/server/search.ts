/*
 * @Author: zi.yang
 * @Date: 2025-02-11 09:37:59
 * @LastEditors: zi.yang
 * @LastEditTime: 2025-03-13 09:38:00
 * @Description: Google 自定义搜索 API 封装
 * @FilePath: /ollama-web-search/src/app/server/search.ts
 */

import axios from 'axios';
import { createLogger } from './utils';

// 创建日志实例
const logger = createLogger('search');

// 搜索配置
const SEARCH_CONFIG = {
  API_URL: process.env.SEARXNG_API_URL || 'http://127.0.0.1:8080/search',
  MAX_RESULTS: 10,
  TIMEOUT: 30000 // 30 秒超时
};

/**
 * 搜索结果项接口
 */
export interface SearchResultItem {
  url: string;
  title?: string;
  snippet?: string;
  content?: string;
}

/**
 * 搜索响应接口
 */
export interface SearchResponse {
  results: SearchResultItem[];
  [key: string]: unknown; // 其他可能的属性
}

/**
 * 使用自定义搜索 API 进行搜索
 *
 * @param query - 搜索关键词
 * @returns 返回搜索结果的数据，失败返回 null
 */
export async function webSearch(query: string): Promise<SearchResponse | null> {
  // 验证搜索关键词
  if (!query || typeof query !== 'string') {
    logger.error("webSearch: 无效的搜索关键词");
    return null;
  }

  try {
    // 发送搜索请求
    const response = await axios.get<SearchResponse>(SEARCH_CONFIG.API_URL, {
      params: {
        q: query,
        format: 'json',
      },
      timeout: SEARCH_CONFIG.TIMEOUT
    });

    // 验证响应数据
    if (!response.data || !response.data.results || !Array.isArray(response.data.results)) {
      logger.warn("webSearch: 搜索响应数据格式无效");
      return null;
    }

    // 限制结果数量
    const limitedResults: SearchResponse = {
      ...response.data,
      results: response.data.results.slice(0, SEARCH_CONFIG.MAX_RESULTS)
    };
    
    return limitedResults;
  } catch (error) {
    // 错误处理
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // 安全地访问错误响应
    type ErrorWithResponse = Error & { response?: { status?: number; data?: unknown } };
    const errorResponse = error instanceof Error && 'response' in error ? 
      (error as ErrorWithResponse).response : undefined;
    
    logger.error("webSearch: 搜索请求失败", {
      message: errorMessage,
      status: errorResponse?.status,
      data: errorResponse?.data
    });
    
    return null;
  }
}
