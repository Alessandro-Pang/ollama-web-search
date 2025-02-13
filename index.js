/*
 * @Author: zi.yang
 * @Date: 2025-02-11 09:37:51
 * @LastEditors: zi.yang
 * @LastEditTime: 2025-02-13 09:36:46
 * @Description: Google 搜索 + Ollama 生成式回答
 * @FilePath: /ollama-web-search/index.js
 */

import dotenv from 'dotenv';

import { generateResponse } from './src/ollama.js';
import { searchGoogle } from './src/search.js';
import { fetchWebContent } from './src/web-page.js';

dotenv.config({ path: ['.env.local', '.env'] });

/**
 * 获取所有页面的内容
 *
 * @param items 页面链接数组，每个元素为一个对象，包含页面链接link属性
 * @returns 返回一个Promise，当所有请求都处理完毕后，解析为包含页面内容的新数组
 */
function getAllPageContent(items) {
  const allRequest = items.map(({ link }) => fetchWebContent(link));
  return new Promise((resolve) => {
    Promise.allSettled(allRequest).then((results) => {
      const fulfilledResults = results.filter(({ status }) => status === 'fulfilled');
      resolve(fulfilledResults.map(({ value }, idx) => ({ ...items[idx], content: value })));
    });
  })
}

async function main() {
  const question = process.argv.slice(2).join(' ').trim();

  if (!question) {
    console.error('错误: 请输入要搜索的问题');
    process.exit(1);
  }

  console.log(`问题: ${question}`);

  // 生成搜索关键词
  const questionPrompt = `请严格基于以下用户提问的核心语义，提炼出3-5个精准的Google搜索关键词。要求：

1. 关键词必须完全来自原句内容，禁止添加任何外部信息
2. 保持原始语义的完整性，核心术语不得拆分或重组
3. 用英文半角加号连接（例：量子计算+应用场景+技术难点）
4. 输出仅返回关键词组合，不加任何说明

输入内容：${question}

（示例：
用户输入：如何解决量子计算机的散热问题
正确输出：量子计算机+散热问题+解决方案） `;

  try {
    const searchPrompt = await generateResponse(questionPrompt);
    const search = searchPrompt.trim().split('\n').pop(); // 获取最后一行内容
    console.log(`搜索关键词: ${search}`);

    // 进行 Google 搜索
    const searchResult = await searchGoogle(search);
    if (!searchResult?.items || searchResult.items.length === 0) {
      console.error('未找到相关搜索结果');
      return;
    }
    const results = await getAllPageContent(searchResult.items);

    // 组合搜索摘要
    const webContent = results
      .map(({ content }) => content)
      .filter(Boolean) // 过滤 undefined/null
      .join('\n');

    // 生成回答
    const answerPrompt = `基于以下网络搜索结果回答问题：\n${webContent}\n问题：${question} \n答案：`;
    const response = await generateResponse(answerPrompt);

    console.log(`回答:\n${response.trim()}`);
  } catch (error) {
    console.error('发生错误:', error.message);
  }
}

main();
