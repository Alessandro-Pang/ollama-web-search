/*
 * @Author: zi.yang
 * @Date: 2025-02-11 09:37:59
 * @LastEditors: zi.yang
 * @LastEditTime: 2025-02-14 17:04:11
 * @Description:  Google 自定义搜索 API 封装
 * @FilePath: /ollama-web-search/src/search.js
 */
import axios from 'axios';

import { createLogger } from './utils.js';

const logger = createLogger('search');

/**
 * Google 搜索 API 参数对象
 * 参考文档：https://developers.google.com/custom-search/docs/json_api_reference
 */
const DEFAULT_PARAMS = {
  // 启用或停用简体中文和繁体中文搜索
  // 1：已停用，0：已启用（默认）
  c2coff: '0',

  // 将搜索结果限制为来自特定国家/地区的文档
  // 例如：'countryUS' 表示美国
  cr: undefined,

  // 根据日期将结果限制为网址
  // 例如：'d7' 表示过去 7 天，'m1' 表示过去 1 个月
  dateRestrict: undefined,

  // 标识搜索结果中所有文档必须包含的词组
  exactTerms: undefined,

  // 标识不应在搜索结果的任何文档中出现的字词或词组
  excludeTerms: undefined,

  // 将结果限制为指定扩展名的文件
  // 例如：'pdf' 表示只搜索 PDF 文件
  fileType: undefined,

  // 开启或关闭重复内容过滤器
  // 0：关闭，1：开启（默认）
  filter: '1',

  // 最终用户的地理位置
  // 例如：'us' 表示美国，'cn' 表示中国
  gl: undefined,

  // 指定搜索范围的结束值
  highRange: undefined,

  // 设置界面语言
  // 例如：'zh-CN' 表示简体中文
  hl: 'zh-CN',

  // 向查询附加指定的查询字词
  hq: undefined,

  // 返回黑白、灰度、透明或彩色图片
  // 可选值：'color', 'gray', 'mono', 'trans'
  imgColorType: undefined,

  // 返回特定主色的图片
  // 可选值：'black', 'blue', 'brown', 'gray', 'green', 'orange', 'pink', 'purple', 'red', 'teal', 'white', 'yellow'
  imgDominantColor: undefined,

  // 返回指定尺寸的图片
  // 可选值：'huge', 'icon', 'large', 'medium', 'small', 'xlarge', 'xxlarge'
  imgSize: undefined,

  // 返回某个类型的图片
  // 可选值：'clipart', 'face', 'lineart', 'stock', 'photo', 'animated'
  imgType: undefined,

  // 指定所有搜索结果都应包含指向特定网址的链接
  linkSite: undefined,

  // 指定搜索范围的起始值
  lowRange: undefined,

  // 将搜索范围限制为以特定语言撰写的文档
  // 例如：'lang_zh-CN' 表示简体中文
  lr: undefined,

  // 要返回的搜索结果数，有效值为 1 到 10
  num: 10,

  // 提供要在文档中检查的其他搜索字词
  orTerms: undefined,

  // 基于许可的过滤条件
  // 例如：'cc_publicdomain' 表示公共领域
  rights: undefined,

  // 搜索安全级别
  // 可选值：'active'（启用安全搜索），'off'（停用安全搜索，默认）
  safe: 'off',

  // 指定搜索类型
  // 可选值：'image'（图片搜索）
  searchType: undefined,

  // 指定应始终从结果中包含或排除的给定网站
  siteSearch: undefined,

  // 控制是否包含或排除 `siteSearch` 参数中指定的网站的结果
  // 可选值：'e'（排除），'i'（包含）
  siteSearchFilter: undefined,

  // 要应用于结果的排序表达式
  // 例如：'date' 表示按日期排序
  sort: undefined,

  // 要返回的第一个结果的索引
  // 例如：11 表示从第二页开始
  start: 1,
};


/**
 * 使用 Google 自定义搜索 API 进行搜索
 *
 * @param {string} query 搜索关键词
 * @param {DEFAULT_PARAMS} [params] 自定义搜索参数
 * @returns {Promise<Object|null>} 返回搜索结果的数据，失败返回 null
 */
export async function searchGoogle(query, params) {
  const { GOOGLE_SEARCH_ID, GOOGLE_SEARCH_KEY } = process.env;

  if (!GOOGLE_SEARCH_ID || !GOOGLE_SEARCH_KEY) {
    logger.error("searchGoogle: 缺少 Google 搜索 API 相关的环境变量");
    return null;
  }

  if (!query || typeof query !== 'string') {
    logger.error("searchGoogle: 无效的搜索关键词");
    return null;
  }

  try {
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        cx: GOOGLE_SEARCH_ID,
        key: GOOGLE_SEARCH_KEY,
        q: query,
        ...DEFAULT_PARAMS, // 应用默认参数
        ...params, // 应用自定义参数
      },
    });

    return response.data || null;
  } catch (error) {
    logger.error("searchGoogle: 搜索请求失败", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    return null;
  }
}
