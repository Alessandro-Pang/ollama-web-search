/*
 * @Author: zi.yang
 * @Date: 2025-02-12 08:55:01
 * @LastEditors: zi.yang
 * @LastEditTime: 2025-03-13 09:36:00
 * @Description: 抓取网页内容，提取正文并返回
 * @FilePath: /ollama-web-search/src/app/server/scraping.ts
 */

import axios, { AxiosRequestConfig } from 'axios';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import { createLogger } from './utils';

// 创建日志实例
const logger = createLogger('scraping');

// 配置常量
const CONFIG = {
  MAX_RETRIES: 3,         // 最大重试次数
  RETRY_DELAY: 2000,      // 重试间隔时间（毫秒）
  REQUEST_TIMEOUT: 60000, // 请求超时时间（毫秒）
  MAX_REDIRECTS: 5        // 最大重定向次数
};

// 随机用户代理列表
const USER_AGENTS: string[] = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; AS; rv:11.0) like Gecko',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1'
];

/**
 * 获取随机用户代理
 * @returns 随机用户代理字符串
 */
function getRandomUserAgent(): string {
  const randomIndex = Math.floor(Math.random() * USER_AGENTS.length);
  return USER_AGENTS[randomIndex];
}

/**
 * 抓取网页内容
 * @param url - 目标网页 URL
 * @param retries - 当前重试次数
 * @returns 网页正文内容，失败返回 null
 */
export async function fetchWebContent(url: string, retries = 0): Promise<string | null> {
  try {
    // 请求配置
    const requestConfig: AxiosRequestConfig = {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'accept-language': 'zh-CN,zh;q=0.9',
        'cache-control': 'no-cache',
        'pragma': 'no-cache',
        'priority': 'u=0, i',
        'sec-ch-ua': '"Not:A-Brand";v="24", "Chromium";v="134"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'cross-site',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1',
        'Referer': 'https://www.google.com/'
      },
      timeout: CONFIG.REQUEST_TIMEOUT,
      maxRedirects: CONFIG.MAX_REDIRECTS
    };

    // 发送请求
    const response = await axios.get(url, requestConfig);

    // 处理响应数据，先移除所有样式标签
    const cleanHtml = response.data.replace(/<style(\s|>).*?<\/style>/gi, '');
    
    // 使用 jsdom 创建 DOM 环境
    const dom = new JSDOM(cleanHtml);
    const document = dom.window.document;

    // 使用 Readability 提取正文
    const article = new Readability(document).parse();
    
    // 返回处理后的文本，移除多余空白
    return article?.textContent?.replace(/\s+/g, '') || null;
  } catch (error) {
    // 错误处理与重试机制
    if (retries < CONFIG.MAX_RETRIES) {
      const errorMessage = error instanceof Error ? error.message : error;
      logger.warn(`请求 ${url} 失败，正在进行第 ${retries + 1} 次重试...`, errorMessage);
      
      // 等待一段时间后重试
      await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
      return fetchWebContent(url, retries + 1);
    } else {
      // 超过最大重试次数，记录错误并返回 null
      const errorMessage = error instanceof Error ? error.message : error;
      logger.error(`抓取失败: ${url}，已达到最大重试次数`, errorMessage);
      return null;
    }
  }
}