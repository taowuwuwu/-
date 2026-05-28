# 自动化工作流引擎 (FlowEngine)

## 项目概述
类似 Dify / Coze 的开源简化版工作流引擎。通过节点连线的方式编排 LLM 处理流程，支持 DAG (有向无环图) 任务调度、流式输出和可视化编排。

## 技术栈
- **后端**: Node.js (Express/NestJS) 或 C# (.NET 6+)
- **前端**: React + React Flow (可视化编排)
- **数据库**: PostgreSQL (存储工作流定义) + Redis (缓存/队列)
- **任务队列**: Bull (Node.js) 或 Hangfire (C#)
- **LLM 集成**: OpenAI API, Azure OpenAI, 本地模型
- **部署**: Docker, Docker Compose, Kubernetes (可选)

## 核心功能

### 1. 可视化工作流编排
- **节点类型**:
  - 📝 **LLM 节点**: 调用大语言模型进行处理
  - 🔍 **搜索节点**: 网页抓取、API 调用
  - 📊 **代码节点**: 执行自定义 JavaScript/Python 代码
  - 🔄 **条件节点**: 基于条件分支执行不同路径
  - 📥 **输入节点**: 接收用户输入
  - 📤 **输出节点**: 返回最终结果
  - 💾 **数据库节点**: 读写数据库
  - ⏰ **定时节点**: 延迟执行、定时触发

- **连线管理**: 节点间数据流转定义
- **版本控制**: 工作流版本管理与回滚
- **模板市场**: 预置常用工作流模板

### 2. DAG 任务调度引擎
- **有向无环图验证**: 防止循环依赖
- **拓扑排序**: 确定节点执行顺序
- **并行执行**: 独立分支并行处理
- **依赖管理**: 等待上游节点完成
- **动态 DAG**: 运行时根据条件调整执行路径

### 3. 流式输出 (SSE)
- **实时反馈**: LLM 生成内容实时推送给前端
- **节点进度**: 显示每个节点的执行状态
- **中间结果**: 可查看任意节点的输出
- **断点续传**: 支持中断后从断点继续

### 4. 执行管理与监控
- **执行历史**: 完整记录每次执行日志
- **性能分析**: 节点耗时统计、瓶颈识别
- **错误处理**: 重试机制、失败回调
- **资源限制**: CPU/内存/超时时间控制

### 5. 扩展系统
- **自定义节点**: 插件式开发新节点类型
- **API 集成**: 轻松对接第三方服务
- **Webhook**: 外部系统触发工作流
- **SDK**: 提供客户端 SDK 方便集成

## 项目结构
```
workflow-engine/
├── backend/
│   ├── src/
│   │   ├── controllers/        # API 控制器
│   │   ├── services/
│   │   │   ├── workflow.service.ts    # 工作流管理
│   │   │   ├── execution.service.ts   # 执行引擎
│   │   │   ├── dag.service.ts         # DAG 调度
│   │   │   └── node/                  # 节点实现
│   │   │       ├── llm.node.ts
│   │   │       ├── code.node.ts
│   │   │       ├── condition.node.ts
│   │   │       └── ...
│   │   ├── models/             # 数据模型
│   │   ├── middleware/         # 中间件
│   │   ├── utils/              # 工具函数
│   │   └── app.ts              # 应用入口
│   ├── tests/
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FlowCanvas.tsx       # 画布组件
│   │   │   ├── NodePalette.tsx      # 节点面板
│   │   │   ├── NodeConfig.tsx       # 节点配置
│   │   │   ├── ExecutionMonitor.tsx # 执行监控
│   │   │   └── ...
│   │   ├── hooks/
│   │   ├── stores/                  # 状态管理 (Zustand/Redux)
│   │   ├── types/                   # TypeScript 类型定义
│   │   └── App.tsx
│   ├── package.json
│   └── Dockerfile
├── examples/                    # 示例工作流
│   ├── web-summarize.json       # 网页摘要
│   ├── translate-pipeline.json  # 翻译流水线
│   └── data-etl.json            # 数据 ETL
├── docker-compose.yml
├── docs/
└── README.md
```

## 快速开始

### 前置要求
- Node.js 18+ 或 .NET 6+
- PostgreSQL 14+
- Redis 6+
- Docker & Docker Compose

### 使用 Docker Compose 一键启动
```bash
docker-compose up -d
```

### 手动启动后端
```bash
cd backend
npm install
npm run dev
```

### 手动启动前端
```bash
cd frontend
npm install
npm run dev
```

### 访问应用
- 前端界面：http://localhost:3000
- API 文档：http://localhost:8000/api/docs

## 核心亮点与面试考点

### DAG 设计与实现
- ✅ 有向无环图数据结构设计
- ✅ 拓扑排序算法 (Kahn's Algorithm / DFS)
- ✅ 循环依赖检测
- ✅ 动态 DAG 调整策略
- ✅ 并发执行与同步控制

### 任务调度
- ✅ 异步任务队列 (Bull/Hangfire)
- ✅ 优先级调度
- ✅ 任务重试与超时处理
- ✅ 分布式锁防止重复执行
- ✅ 任务取消与清理

### 流式输出 (SSE)
- ✅ Server-Sent Events 实现原理
- ✅ LLM 流式响应转发
- ✅ 多客户端订阅管理
- ✅ 连接心跳与断线重连
- ✅ 前端流式渲染优化

### 节点系统设计
- ✅ 策略模式实现多节点类型
- ✅ 节点输入/输出类型检查
- ✅ 节点间数据传递机制
- ✅ 自定义节点扩展接口
- ✅ 节点沙箱隔离 (代码节点)

### 性能优化
- ✅ 节点执行结果缓存
- ✅ 批量 API 调用优化
- ✅ 数据库查询优化
- ✅ 内存管理与垃圾回收
- ✅ 水平扩展方案

## 工作流示例

### 示例 1: 智能客服工作流
```
用户问题 → [意图识别 LLM] → [条件判断]
                              ├─→ [知识库检索] → [答案生成 LLM] → 输出
                              ├─→ [订单查询 API] → 格式化 → 输出
                              └─→ [转人工] → 通知客服 → 输出
```

### 示例 2: 内容创作工作流
```
主题输入 → [大纲生成 LLM] → [分段写作 LLM] (并行)
                                              ↓
                                    [内容合并] → [润色 LLM] → [敏感词检查] → 输出
```

### 示例 3: 数据分析工作流
```
上传 CSV → [数据清洗代码节点] → [统计分析代码节点] 
                                      ↓
                            [图表生成] → [报告撰写 LLM] → 输出 PDF
```

## API 示例

### 创建工作流
```bash
curl -X POST http://localhost:8000/api/workflows \
  -H "Content-Type: application/json" \
  -d '{
    "name": "智能客服",
    "nodes": [...],
    "edges": [...]
  }'
```

### 执行工作流
```bash
curl -X POST http://localhost:8000/api/workflows/{id}/execute \
  -H "Content-Type: application/json" \
  -d '{"input": {"question": "如何退款？"}}'
```

### 流式执行 (SSE)
```javascript
const eventSource = new EventSource(
  '/api/workflows/{id}/execute/stream',
  { body: JSON.stringify({ input: {...} }) }
);
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('节点:', data.nodeName, '输出:', data.output);
};
```

## 测试与监控

### 单元测试
- 节点逻辑测试
- DAG 调度算法测试
- API 接口测试

### 集成测试
- 完整工作流执行测试
- 并发执行测试
- 异常恢复测试

### 监控指标
- 工作流执行成功率
- 平均执行时长
- 节点耗时分布
- 资源使用率

## 扩展计划
- [ ] 子工作流嵌套调用
- [ ] 工作流市场 (分享与导入)
- [ ] A/B 测试支持
- [ ] 工作流性能分析器
- [ ] 多人协作编辑
- [ ] 审计日志

## License
MIT
