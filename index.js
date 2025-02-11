/*
 * @Author: zi.yang
 * @Date: 2025-02-11 09:37:51
 * @LastEditors: zi.yang
 * @LastEditTime: 2025-02-11 11:02:33
 * @Description: 
 * @FilePath: /ollama-web-search/index.js
 */
import dotenv from 'dotenv';

import generate from './src/ollama.js';
import searchGoogle from './src/search.js';

dotenv.config({ path: ['.env.local', '.env'] })

async function main() {
  const question = process.argv[2];
  const questionPrompt = `请根据以下内容总结用于 Google 搜索的关键词：${question}，并以加号分隔关键词，例如：关键词1 + 关键词2 + 关键词3。只返回关键词，不要包含其他内容。`;
  const searchPrompt = await generate(questionPrompt);
  const search = searchPrompt.substring(searchPrompt.lastIndexOf('\n') + 1)
  console.log('搜索提示词：' + search);
  const searchResult = await searchGoogle(search)
  const snippets = searchResult.items.map(({ snippet }) => snippet).join(',')
  const prompt = `基于以下网络搜索结果回答问题：\n${snippets}\n问题：${question}答案：`;
  const response = await generate(prompt);
  console.log('回答：' + response);
}

main()