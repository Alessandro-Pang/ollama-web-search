'use server'
/*
 * @Author: zi.yang
 * @Date: 2025-02-11 17:19:57
 * @LastEditors: zi.yang
 * @LastEditTime: 2025-03-11 17:55:53
 * @Description: 
 * @FilePath: /ollama-web-search/src/chromadb.js
 */
import { ChromaClient } from 'chromadb';
import { env } from 'chromadb-default-embed';

import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

import { createLogger } from './utils.js';

// 配置日志记录
const logger = createLogger('chromadb');

let chromaInstance = null;

function getChromaClient() {
  if (chromaInstance) return chromaInstance;
  const { HUGGING_FACE_MIRROR, CHROMADB_PATH } = process.env
  // 修改 hugging face 镜像地址
  if (HUGGING_FACE_MIRROR) {
    env.remoteHost = HUGGING_FACE_MIRROR;
  }
  if (!CHROMADB_PATH) {
    logger.error(`没有指定 Chroma 数据库地址，请在环境变量中设置 CHROMADB_PATH`);
    throw new Error(`没有指定 Chroma 数据库地址，请在环境变量中设置 CHROMADB_PATH`);
  }
  chromaInstance = new ChromaClient({ path: CHROMADB_PATH });
  return chromaInstance;
}

/**
 * 创建或加载集合
 * @param {string} collectionName - 集合名称
 * @param {string} [description=''] - 集合描述
 * @returns {Promise<Collection>} - ChromaDB 集合
 */
export async function getOrCreateCollection(collectionName, description = '') {
  if (!collectionName) throw new Error('集合名称不能为空')
  const chromaClient = getChromaClient();
  try {
    const collection = await chromaClient.getOrCreateCollection({
      name: collectionName,
      metadata: {
        description,
        created: (new Date()).toString()
      },
    });
    return collection;
  } catch (error) {
    logger.error(`创建或加载集合 ${collectionName} 失败:`, error);
    throw new Error(`创建或加载集合 ${collectionName} 失败: ${error.message}`);
  }
}

/**
 * 将结果存储到 Chroma 数据库中
 *
 * @param {Array<Object>} results - 结果数组，每个元素包含 url、title 和 content 属性
 * @param {string} [collectionName='web_pages'] - 集合名称
 * @returns {Promise<void>}
 */
export async function storeInChroma(results, collectionName = 'web_pages') {
  results = results.filter(({ link, content }) => link && content)
  if (!Array.isArray(results) || results.length === 0) {
    logger.error('存储数据失败: 结果数组为空');
    throw new Error('存储数据失败: 结果数组为空');
  }

  const collection = await getOrCreateCollection(collectionName, '存储网页数据');

  try {
    await collection.add({
      ids: results.map(({ link }) => link),
      metadatas: results.map(({ title, link }) => ({ title, link })),
      documents: results.map(({ content }) => content), // 主要网页内容
    });
    logger.info(`数据存储到集合 ${collectionName} 成功`);
  } catch (error) {
    logger.error(`数据存储到集合 ${collectionName} 失败:`, error);
    throw new Error(`数据存储到集合 ${collectionName} 失败: ${error.message}`);
  }
}

/**
 * 使用 LangChain 进行文本分片并存储到 ChromaDB
 * @param {Array<Object>} webPages - 网页数据数组，每个对象包含 link、title 和 content 属性
 * @param {string} collectionName - 集合名称
 */
export async function splitAndStoreInChroma(webPages, collectionName = 'web_pages') {
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1500, // 每个分片的最大长度
    chunkOverlap: 250, // 相邻分片的重叠长度
    separators: ['。', '！', '？', '\n', ' ', ''] // 自定义分隔符
  });

  const allSlices = [];
  for (const page of webPages) {
    const { url, title, content } = page;
    const slices = await textSplitter.splitText(content);
    slices.forEach((slice, index) => {
      allSlices.push({
        link: `${url}-slice-${index}`,
        title: `${title}-slice-${index}`,
        content: slice
      });
    });
  }
  await storeInChroma(allSlices, collectionName);
}

/**
 * 删除指定集合中的所有数据
 * @param {string} collectionName - 集合名称
 * @returns {Promise<void>}
 */
export async function deleteAllByCollection(collectionName) {
  const collection = await getOrCreateCollection(collectionName);
  try {
    const content = await collection.get();
    if (content.ids && content.ids.length > 0) {
      await collection.delete({ ids: content.ids });
    }
    logger.info(`集合 ${collectionName} 中的所有数据删除成功`);
  } catch (error) {
    logger.error(`删除集合 ${collectionName} 中的数据失败:`, error);
    throw new Error(`删除集合 ${collectionName} 中的数据失败: ${error.message}`);
  }
}

/**
 * 获取指定集合中的所有数据
 * @param {string} collectionName - 集合名称
 * @returns {Promise<Object>} - 集合中的数据
 */
export async function getAllByCollection(collectionName) {
  const collection = await getOrCreateCollection(collectionName);
  try {
    logger.info(`正在获取集合 ${collectionName} 的数据`);
    return await collection.get();
  } catch (error) {
    logger.error(`获取集合 ${collectionName} 的数据失败:`, error);
    throw new Error(`获取集合 ${collectionName} 的数据失败: ${error.message}`);
  }
}

/**
 * 根据文本查询指定集合
 * @param {Array<string>} queryTexts - 查询文本数组
 * @param {string} [collectionName='web_pages'] - 集合名称
 * @returns {Promise<Object>} - 查询结果
 */
export async function queryCollectionByText(queryTexts, collectionName = 'web_pages') {
  if (!Array.isArray(queryTexts) || queryTexts.length === 0) {
    logger.error('查询数据失败: 查询文本数组为空');
    throw new Error('查询数据失败: 查询文本数组为空');
  }

  const collection = await getOrCreateCollection(collectionName);
  try {
    const result = await collection.query({ queryTexts });
    return result;
  } catch (error) {
    logger.error(`查询集合 ${collectionName} 失败:`, error);
    throw new Error(`查询集合 ${collectionName} 失败: ${error.message}`);
  }
}
