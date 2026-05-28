# 企业级私有知识库问答 Agent (RAG-KnowledgeBase)

## 项目概述
基于 RAG (Retrieval-Augmented Generation) 技术，构建企业级私有知识库问答系统。支持上传 PDF、Word、Excel 等文档，AI 能够根据文档内容准确回答问题，并附带引用来源。

## 技术栈
- **后端**: Python FastAPI
- **AI/LLM**: LangChain, OpenAI API / 本地 LLM (ChatGLM, Qwen)
- **向量数据库**: ChromaDB / Milvus / Weaviate
- **文档解析**: PyPDF2, python-docx, pandas, Unstructured
- **检索增强**: 混合检索 (向量 + BM25), Rerank 模型
- **前端**: React + TypeScript
- **部署**: Docker, Docker Compose

## 核心功能

### 1. 文档处理引擎
- **多格式支持**: PDF, Word, Excel, PPT, TXT, Markdown
- **智能分块 (Chunking)**: 
  - 按语义分块 (使用 NLP 模型识别段落边界)
  - 表格特殊处理 (保留结构信息)
  - 图片 OCR 识别 (可选)
  - 重叠分块策略 (避免信息割裂)
- **元数据提取**: 自动提取文档标题、作者、创建时间等

### 2. 混合检索系统
- **向量检索 (Dense Retrieval)**: 使用 Embedding 模型 (text-embedding-ada-002 / m3e-base)
- **关键词检索 (Sparse Retrieval)**: BM25 算法
- **加权融合**: 动态调整两种检索结果的权重
- **元数据过滤**: 按时间、文档类型、标签等过滤

### 3. 重排优化 (Rerank)
- **Cross-Encoder 模型**: bge-reranker, cohere-rerank
- **二次排序**: 对召回的 Top-K 结果重新打分排序
- **阈值过滤**: 自动过滤低相关性结果

### 4. Agent 工具调用
- **Function Calling**: 让 LLM 能够调用外部工具
- **内置工具**:
  - 数据库查询 (SQL 生成与执行)
  - 邮件发送
  - API 调用
  - 代码解释器
- **自定义工具**: 插件式扩展机制

### 5. 问答交互
- **流式输出**: SSE (Server-Sent Events) 实时返回答案
- **引用标注**: 答案中标注引用来源 (文档名 + 页码 + 原文片段)
- **多轮对话**: 支持上下文记忆
- **反馈机制**: 用户对答案点赞/点踩，优化检索策略

## 项目结构
```
rag-knowledge-base/
├── backend/
│   ├── app/
│   │   ├── api/              # API 路由
│   │   ├── core/             # 核心配置
│   │   ├── models/           # 数据模型
│   │   ├── services/         # 业务逻辑
│   │   │   ├── document_service.py    # 文档处理
│   │   │   ├── retrieval_service.py   # 检索服务
│   │   │   ├── rag_service.py         # RAG 核心
│   │   │   └── agent_service.py       # Agent 工具调用
│   │   ├── utils/            # 工具函数
│   │   └── main.py           # 应用入口
│   ├── tests/
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/       # React 组件
│   │   ├── pages/            # 页面
│   │   ├── hooks/            # 自定义 Hooks
│   │   └── App.tsx
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── docs/                     # 文档
└── README.md
```

## 快速开始

### 前置要求
- Python 3.9+
- Node.js 16+
- Docker & Docker Compose
- OpenAI API Key (或本地 LLM 模型)

### 使用 Docker Compose 一键启动
```bash
docker-compose up -d
```

### 手动启动后端
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 手动启动前端
```bash
cd frontend
npm install
npm run dev
```

### 访问应用
- 前端界面：http://localhost:3000
- API 文档：http://localhost:8000/docs

## 核心亮点与面试考点

### 文档解析与分块
- ✅ 复杂表格处理 (保留行列结构)
- ✅ 图片 OCR 识别 (Tesseract / PaddleOCR)
- ✅ 语义分块 vs 固定长度分块对比
- ✅ 分块策略对检索效果的影响分析

### 混合检索
- ✅ 向量检索 (Embedding 模型选型与优化)
- ✅ BM25 关键词检索实现
- ✅ 加权融合算法 (Reciprocal Rank Fusion)
- ✅ 检索效果评估 (Recall@K, NDCG)

### 重排优化
- ✅ Cross-Encoder 模型集成
- ✅ Rerank 对最终答案质量提升
- ✅ 延迟与精度的权衡

### Agent 工具调用
- ✅ Function Calling 实现原理
- ✅ 工具描述 Prompt 工程
- ✅ 工具执行结果注入上下文
- ✅ 安全限制 (防止恶意代码执行)

### 性能优化
- ✅ 向量索引优化 (HNSW, IVF)
- ✅ 缓存策略 (Redis 缓存热点查询)
- ✅ 异步并发处理 (Celery 任务队列)
- ✅ 批量 Embedding 生成

## API 示例

### 上传文档
```bash
curl -X POST http://localhost:8000/api/documents \
  -F "file=@company_handbook.pdf" \
  -F "metadata={\"department\": \"HR\", \"version\": \"2024\"}"
```

### 发起问答
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "公司年假政策是什么？",
    "top_k": 5,
    "use_rerank": true
  }'
```

### 流式响应 (SSE)
```javascript
const eventSource = new EventSource('/api/chat/stream?query=年假政策');
eventSource.onmessage = (event) => {
  console.log('收到:', JSON.parse(event.data));
};
```

## 测试数据集
提供示例文档集用于测试：
- 员工手册 (PDF)
- 产品文档 (Markdown)
- 销售报表 (Excel)
- 会议纪要 (Word)

## 扩展计划
- [ ] 多租户支持
- [ ] 权限控制 (文档级别访问控制)
- [ ] 自动摘要生成
- [ ] 知识图谱构建
- [ ] 多模态检索 (图片 + 文本)

## License
MIT
