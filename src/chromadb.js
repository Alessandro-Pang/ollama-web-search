/*
 * @Author: zi.yang
 * @Date: 2025-02-11 17:19:57
 * @LastEditors: zi.yang
 * @LastEditTime: 2025-02-14 14:26:25
 * @Description: 
 * @FilePath: /ollama-web-search/src/chromadb.js
 */
import { ChromaClient } from 'chromadb';
import { env } from 'chromadb-default-embed';

env.remoteHost = 'https://hf-mirror.com';

// 初始化 ChromaDB 客户端
const chromaClient = new ChromaClient({ path: 'http://localhost:8000' });

/**
 * 创建或加载集合
 * @param {string} collectionName - 集合名称
 * @param {string} [description=''] - 集合描述
 * @returns {Promise<Collection>} - ChromaDB 集合
 */
export async function getOrCreateCollection(collectionName, description = '') {
  const collection = await chromaClient.getOrCreateCollection({
    name: collectionName,
    metadata: {
      description,
      created: (new Date()).toString()
    },
  });
  return collection;
}

/**
 * 将结果存储到Chroma数据库中
 *
 * @param results 结果数组，每个元素包含url、title和content属性
 * @returns 无返回值
 */
export async function storeInChroma(results) {
  const collection = await getOrCreateCollection('web_pages', '存储网页数据');

  // 检查每个结果是否有 link 属性
  if (results.some(result => !result.link)) {
    console.error('部分结果缺少 link 属性');
    return;
  }

  try {
    await collection.add({
      ids: results.map(({ link }) => link),
      metadatas: results.map(({ title, link }) => ({ title, link })),
      documents: results.map(({ content }) => content), // 主要网页内容
    });
    console.log(`存储成功`);
  } catch (error) {
    console.error('存储失败:', error);
  }
}

export async function deleteAllByCollection(collectionName) {
  const collection = await getOrCreateCollection(collectionName);
  try {
    const content = await collection.get();
    await collection.delete({ ids: content.ids });
    console.log(`删除成功`);
  } catch (error) {
    console.error('删除失败:', error);
  }
}

// deleteAllByCollection('web_pages')

export async function getAllByCollection(collectionName) {
  const collection = await getOrCreateCollection(collectionName);
  try {
    return await collection.get();
  } catch (error) {
    console.error('获取失败:', error);
    throw new Error('获取失败: ' + error.message);
  }
}

// getAllByCollection('web_pages').then(console.log)

export async function queryCollectionByText(queryTexts) {
  const collection = await getOrCreateCollection('web_pages');
  try {
    const result = await collection.query({ queryTexts });
    return result;
  } catch (error) {
    console.error('查询失败:', error);
    throw new Error('查询失败: ' + error.message);
  }
}