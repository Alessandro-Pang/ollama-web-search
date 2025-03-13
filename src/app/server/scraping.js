/*
 * @Author: zi.yang
 * @Date: 2025-02-12 08:55:01
 * @LastEditors: zi.yang
 * @LastEditTime: 2025-03-11 18:08:28
 * @Description: 抓取网页内容，提取正文并返回
 * @FilePath: /ollama-web-search/src/scraping.js
 */
import axios from 'axios';
import { JSDOM } from 'jsdom';

import { Readability } from '@mozilla/readability';

import { createLogger } from './utils.js';

const logger = createLogger('scraping');
// 最大重试次数
const MAX_RETRIES = 3;
// 重试间隔时间（毫秒）
const RETRY_DELAY = 2000;

// 随机用户代理列表
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; AS; rv:11.0) like Gecko',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1'
];

/**
 * 获取随机用户代理
 * @returns {string} - 随机用户代理字符串
 */
function getRandomUserAgent() {
  const randomIndex = Math.floor(Math.random() * userAgents.length);
  return userAgents[randomIndex];
}

/**
 * 抓取网页内容
 * @param {string} url - 目标网页 URL
 * @param {number} [retries = 0] - 当前重试次数
 * @returns {string} - 网页正文内容
 */
export async function fetchWebContent(url, retries = 0) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "zh-CN,zh;q=0.9",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "priority": "u=0, i",
        "sec-ch-ua": "\"Not:A-Brand\";v=\"24\", \"Chromium\";v=\"134\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"macOS\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "cross-site",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
      },
      "referrer": "https://www.google.com/",
      "referrerPolicy": "origin",
      "body": null,
      "method": "GET",
      "mode": "cors",
      "credentials": "include",
      timeout: 60000, // 设置超时时间
      maxRedirects: 5 // 设置最大重定向次数
    });

    // 使用 jsdom 创建一个 DOM 环境
    const dom = new JSDOM(response.data.replace(/<style(\s|>).*?<\/style>/gi, ''));
    const document = dom.window.document;

    // 创建 Readability 实例并解析内容
    const article = new Readability(document).parse();
    return article?.textContent.replace(/\s+/g, '');
  } catch (error) {
    if (retries < MAX_RETRIES) {
      logger.warn(`请求 ${url} 失败，正在进行第 ${retries + 1} 次重试...`, error.message || error.stack);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWebContent(url, retries + 1);
    } else {
      logger.error(`抓取失败: ${url}，已达到最大重试次数: `, error.message || error.stack);
      return null;
    }
  }
}