/*
 * @Author: zi.yang
 * @Date: 2025-02-11 09:37:51
 * @LastEditors: zi.yang
 * @LastEditTime: 2025-02-11 16:56:43
 * @Description: Google 搜索 + Ollama 生成式回答
 * @FilePath: /ollama-web-search/index.js
 */

import dotenv from 'dotenv';

import generate from './src/ollama.js';
import searchGoogle from './src/search.js';

dotenv.config({ path: ['.env.local', '.env'] });

async function main() {
  const question = process.argv.slice(2).join(' ').trim();

  if (!question) {
    console.error('错误: 请输入要搜索的问题');
    process.exit(1);
  }

  console.log(`问题: ${question}`);

  // 生成搜索关键词
  const questionPrompt = `请根据以下内容总结用于 Google 搜索的关键词：${question}，并以加号分隔关键词，例如：关键词1 + 关键词2 + 关键词3。只返回关键词，不要自行扩展，不要包含其他内容。`;

  try {
    const searchPrompt = await generate(questionPrompt);
    const search = searchPrompt.trim().split('\n').pop(); // 获取最后一行内容
    console.log(`搜索关键词: ${search}`);

    // 进行 Google 搜索
    const searchResult = await searchGoogle(search);
    if (!searchResult?.items || searchResult.items.length === 0) {
      console.error('未找到相关搜索结果');
      return;
    }

    // 组合搜索摘要
    const snippets = searchResult.items
      .map(({ snippet }) => snippet)
      .filter(Boolean) // 过滤 undefined/null
      .join('\n');

    // 生成回答
    const answerPrompt = `基于以下网络搜索结果回答问题：\n${snippets}\n问题：${question} \n答案：`;
    const response = await generate(answerPrompt);

    console.log('回答:', response.trim());
  } catch (error) {
    console.error('发生错误:', error.message);
  }
}

main();
