/*
 * @Author: zi.yang
 * @Date: 2025-02-11 10:27:42
 * @LastEditors: zi.yang
 * @LastEditTime: 2025-02-11 10:53:47
 * @Description: 
 * @FilePath: /ollama-web-search/src/ollama.js
 */
import { Ollama } from 'ollama';

const ollama = new Ollama({ host: "http://localhost:11434" })
async function generateResponse(prompt, params) {
  const generate = await ollama.generate({
    model: 'deepseek-r1:14b',
    prompt,
    stream: false,
    ...params
  });

  return generate.response;
}

export default generateResponse;
