/*
 * @Author: zi.yang
 * @Date: 2025-02-14 16:58:48
 * @LastEditors: zi.yang
 * @LastEditTime: 2025-02-14 17:05:19
 * @Description: 
 * @FilePath: /ollama-web-search/src/utils.js
 */
import winston from 'winston';

/**
 * 创建一个日志记录器
 *
 * @param filename 日志文件的名称
 * @returns 返回创建的日志记录器
 */
export function createLogger(filename) {
  const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: `./.cache/log/${filename}.log` })
    ]
  });
  return logger
}