# 全栈项目作品集

展示我的全栈开发能力，涵盖分布式系统、AI 工程化和工作流引擎等高阶主题。

## 📁 项目列表

### 1. [轻量级分布式 RPC 框架](./projects/rpc-framework)
**技术栈**: C# / Python, Socket 编程，Redis, Protobuf  
**核心亮点**: 
- 从零实现 RPC 框架，不依赖 Spring Cloud/gRPC
- TCP 粘包处理、自定义二进制协议
- 动态代理实现透明远程调用
- 手写服务注册中心、负载均衡、心跳检测

**面试考点**: 网络编程、序列化、动态代理、分布式系统

---

### 2. [企业级私有知识库问答 Agent](./projects/rag-knowledge-base)
**技术栈**: Python FastAPI, LangChain, ChromaDB, React  
**核心亮点**:
- RAG 架构实现私有文档问答
- 混合检索 (向量 + BM25) + Rerank 优化
- 多格式文档解析 (PDF/Word/Excel)
- Agent 工具调用 (Function Calling)

**面试考点**: AI 工程化、向量数据库、检索算法、Prompt 工程

---

### 3. [自动化工作流引擎](./projects/workflow-engine)
**技术栈**: Node.js/C#, React Flow, PostgreSQL, Redis  
**核心亮点**:
- 可视化 DAG 工作流编排
- 拓扑排序与并行任务调度
- SSE 流式输出实时反馈
- 插件式节点扩展系统

**面试考点**: DAG 算法、任务调度、流式处理、系统设计

---

## 🎯 求职意向

**目标职位**: 全栈工程师 / 后端工程师 / AI 应用工程师

**技术栈**:
- **前端**: React, TypeScript, Vue
- **后端**: Node.js, Python (FastAPI/Flask), C# (.NET)
- **数据库**: PostgreSQL, MySQL, Redis, MongoDB
- **DevOps**: Docker, Kubernetes, CI/CD, AWS/Azure

## 📊 项目统计

| 项目 | 代码量 | 测试覆盖 | 文档完整度 |
|------|--------|----------|------------|
| RPC 框架 | ~5k LOC | 80%+ | ✅ |
| RAG 知识库 | ~8k LOC | 75%+ | ✅ |
| 工作流引擎 | ~10k LOC | 70%+ | ✅ |

## 🚀 快速开始

每个项目都包含独立的 README 和 Docker 配置，可单独运行：

```bash
# 启动 RPC 框架示例
cd projects/rpc-framework
docker-compose up -d

# 启动 RAG 知识库
cd projects/rag-knowledge-base
docker-compose up -d

# 启动工作流引擎
cd projects/workflow-engine
docker-compose up -d
```

## 📝 开发计划

- [x] 项目规划与架构设计
- [ ] RPC 框架核心实现
- [ ] RAG 知识库 MVP
- [ ] 工作流引擎可视化编排
- [ ] 单元测试与集成测试
- [ ] 性能优化与基准测试
- [ ] 部署文档与 Demo 视频

## 📫 联系方式

- GitHub: [你的 GitHub 用户名]
- Email: [你的邮箱]
- 博客：[你的博客链接]

---

*最后更新：2024 年*
