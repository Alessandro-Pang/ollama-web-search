/*
 * @Author: zi.yang
 * @Date: 2025-02-14 16:58:48
 * @LastEditors: zi.yang
 * @LastEditTime: 2025-03-13 09:45:00
 * @Description: 实用工具函数
 * @FilePath: /ollama-web-search/src/app/server/utils.ts
 */

import winston from 'winston';
import { Logger } from 'winston';
import path from 'path';
import fs from 'fs';

// 日志配置
const LOG_CONFIG = {
  DEFAULT_LEVEL: 'info',
  LOG_DIR: './.cache/log'
};

/**
 * 确保日志目录存在
 */
function ensureLogDirectory(): void {
  const logDir = path.resolve(process.cwd(), LOG_CONFIG.LOG_DIR);
  if (!fs.existsSync(logDir)) {
    try {
      fs.mkdirSync(logDir, { recursive: true });
    } catch (error) {
      console.error(`Failed to create log directory: ${logDir}`, error);
    }
  }
}

/**
 * 创建一个日志记录器
 *
 * @param module - 模块名称，用于标识日志来源
 * @param level - 日志级别，默认为 'info'
 * @returns 返回创建的日志记录器
 */
export function createLogger(module: string, level: string = LOG_CONFIG.DEFAULT_LEVEL): Logger {
  // 确保日志目录存在
  ensureLogDirectory();
  
  // 创建格式化器
  const customFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  );
  
  // 创建日志记录器
  const logger = winston.createLogger({
    level: level,
    format: customFormat,
    defaultMeta: { module },
    transports: [
      // 控制台输出
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(({ level, message, timestamp, module, ...rest }) => {
            const restString = Object.keys(rest).length ? 
              ` ${JSON.stringify(rest)}` : '';
            return `${timestamp} [${module}] ${level}: ${message}${restString}`;
          })
        )
      }),
      // 文件输出
      new winston.transports.File({ 
        filename: path.join(LOG_CONFIG.LOG_DIR, `${module}.log`),
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        tailable: true
      })
    ]
  });
  
  return logger;
}

/**
 * 安全地解析 JSON 字符串
 * 
 * @param jsonString - 要解析的 JSON 字符串
 * @param fallback - 解析失败时的默认值
 * @returns 解析后的对象或默认值
 */
export function safeJsonParse<T>(jsonString: string, fallback: T): T {
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    // 错误处理：返回默认值
    return fallback;
  }
}