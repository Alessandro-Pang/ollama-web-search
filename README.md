<!--
 * @Author: zi.yang
 * @Date: 2025-02-11 11:54:58
 * @LastEditors: zi.yang
 * @LastEditTime: 2025-02-14 17:58:59
 * @Description: 
 * @FilePath: /ollama-web-search/README.md
-->

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


# ollama-web-search

ollama + Google 搜索，实现 AI 联网回答

## 安装

### 安装 Ollama

参考文章：[Ollama 部署本地大模型与使用](https://juejin.cn/post/7457812218509377587)

安装 Ollama 后， 下载模型，例如：

```bash
ollama pull deepseek-r1:14b
```

### 安装 ChromaDB

推荐使用 Docker 安装

```bash
docker pull chromadb/chroma
docker run -p 8000:8000 chromadb/chroma
```

或者使用 Python Pip 安装

```bash
pip install chromadb
chroma run --path /db_path
```

### 安装项目依赖

```bash
git clone https://github.com/Alessandro-Pang/ollama-web-search
cd ollama-web-search
pnpm install
```

## 使用

### 配置 Google 搜索 API

需要配置 Google 搜索 API，参考文章：[AnythingLLM 接入 Web Search](https://juejin.cn/post/7459341207492935730)

修改 项目的 `.env` 文件，配置 `GOOGLE_SEARCH_ID` 和 `GOOGLE_SEARCH_KEY`

### 运行

```bash
node index.js "问题内容"
```
