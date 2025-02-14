/*
 * @Author: zi.yang
 * @Date: 2025-02-12 08:55:01
 * @LastEditors: zi.yang
 * @LastEditTime: 2025-02-14 15:49:27
 * @Description: 抓取网页内容，提取正文并返回
 * @FilePath: /ollama-web-search/src/web-page.js
 */
import axios from 'axios';
import { JSDOM } from 'jsdom';

import { Readability } from '@mozilla/readability';

/**
 * 抓取网页内容
 * @param {string} url - 目标网页 URL
 * @returns {string} - 网页正文内容
 */
export async function fetchWebContent(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': 1,
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
      },
      timeout: 60000, // 设置超时时间，例如：10秒
      maxRedirects: 5, // 设置最大重定向次数
    });
    // 使用 jsdom 创建一个 DOM 环境
    const dom = new JSDOM(response.data);
    const document = dom.window.document;

    // 创建 Readability 实例并解析内容
    const article = new Readability(document).parse();
    return article?.textContent;
  } catch (error) {
    console.error(`抓取失败: ${url}`, error.message);
    return null;
  }
}