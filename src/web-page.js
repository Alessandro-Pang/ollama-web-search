/*
 * @Author: zi.yang
 * @Date: 2025-02-12 08:55:01
 * @LastEditors: zi.yang
 * @LastEditTime: 2025-02-12 09:20:17
 * @Description: 抓取网页内容，提取正文并返回
 * @FilePath: /ollama-web-search/src/web-page.js
 */
import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * 抓取网页内容
 * @param {string} url - 目标网页 URL
 * @returns {string} - 网页正文内容
 */
export async function fetchWebContent(url) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // 提取正文内容
    const text = $('body').text()
      .replace(/\s+/g, ' ') // 去除多余空白字符
      .trim();

    return text.slice(0, 5000); // 截取前 5000 字符
  } catch (error) {
    console.error(`抓取失败: ${url}`, error.message);
    return null;
  }
}