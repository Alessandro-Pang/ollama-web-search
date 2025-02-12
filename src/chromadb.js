/*
 * @Author: zi.yang
 * @Date: 2025-02-11 17:19:57
 * @LastEditors: zi.yang
 * @LastEditTime: 2025-02-12 09:19:52
 * @Description:
 * @FilePath: /ollama-web-search/src/chromadb.js
 */
import { ChromaClient } from 'chromadb';

import { getTextEmbeddings } from './embedding.js';

// 初始化 ChromaDB 客户端
const chromaClient = new ChromaClient({ path: 'http://localhost:8000' });

/**
 * 创建或加载集合
 * @param {string} collectionName - 集合名称
 * @returns {Promise<Collection>} - ChromaDB 集合
 */
export async function getOrCreateCollection(collectionName) {
  const collection = await chromaClient.getOrCreateCollection({
    name: collectionName,
    metadata: { description: 'Web content storage' },
  });
  return collection;
}

/**
 * 将数据存储在 Chroma中
 *
 * @param {string} url - 要存储的网页URL
 * @param {string} title - 网页标题
 * @param {string} text - 网页内容文本
 * @returns {Promise<void>}
 */
export async function storeInChroma(url, title, text) {
  const embeddings = await getTextEmbeddings(text);
  const collection = await getOrCreateCollection('web_pages');

  await collection.add({
    ids: [url],
    embeddings: [embeddings],
    metadatas: [{ title, url }],
    documents: [text], // 主要网页内容
  });

  console.log(`存储成功: ${title}`);
}

