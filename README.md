# OmniChat 🚀

**OpenRouter 多 API Key 輪詢 ChatBot Web App** — 可部署到 Vercel、Netlify 或 Cloudflare Pages

---

## ✨ 功能

- 🔑 **多 API Key 輪詢** — 多個 OpenRouter API Keys 自動輪換，避免單 key 限速
- 🤖 **16+ 免費模型可選** — DeepSeek R1、Llama 4、Qwen3、Mistral、Phi 4、Gemma 3 等
- ⚡ **流式響應** — 即時 SSE 串流，打字效果
- 🌙 **深色技術主題** — 精簡美學，Space Grotesk + JetBrains Mono 字體
- 📱 **響應式設計** — 桌面和行動裝置皆可正常使用
- 💾 **對話持久化** — localStorage 自動保存歷史記錄
- ⛔ **支援停止生成** — 隨時中斷 AI 回應

---

## 📁 項目結構

```
omnichat/
├── src/                        # React 前端 (Vite)
│   ├── App.tsx                 # 主組件
│   ├── main.tsx                # 入口
│   ├── index.css               # 樣式
│   ├── client.ts               # API 客戶端 + SSE 解析
│   └── components/
│       ├── ModelSelector.tsx   # 模型選擇器
│       ├── Message.tsx         # 訊息組件
│       └── InputBar.tsx        # 輸入框組件
├── shared/
│   ├── types.ts                # 共用 TypeScript 類型
│   └── models.ts               # 可用模型清單
├── vercel/
│   └── adapters/
│       └── api/
│           └── chat.ts         # Vercel Next.js API 路由
├── netlify/
│   └── functions/
│       └── chat.ts             # Netlify Edge Function
├── cloudflare/
│   └── functions/
│       └── api/
│           └── chat.ts         # Cloudflare Pages Function
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.js
├── .env.example
├── vercel.json
├── netlify.toml
├── cloudflare.json
└── README.md
```

---

## 🛠️ 快速開始

### 1. 安裝依賴

```bash
cd omnichat
npm install
```

### 2. 設定 API Keys

從 `.env.example` 複製環境變數檔案：

```bash
cp .env.example .env.local
```

編輯 `.env.local`，加入你的 OpenRouter API Keys：

```env
# 多個 key 以逗號分隔
OPENROUTER_KEYS=sk-or-v1-key1,sk-or-v1-key2,sk-or-v1-key3
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
```

> 💡 **如何取得 OpenRouter API Key**
> 1. 前往 [openrouter.ai](https://openrouter.ai) 註冊
> 2. 在 Dashboard → Settings → API Keys 創建 key
> 3. 加入多筆 key 以啟用輪詢功能

### 3. 本地開發

```bash
npm run dev
```

打開 `http://localhost:5173` 即可使用。

> ⚠️ **本地開發時需要單獨運行 API 服務**，或使用 Vercel/Cloudflare 的即時預覽功能。

---

## 🚀 部署

### 方案 A: Vercel 部署（推薦）

#### 方式 1: GitHub 直連部署（最簡單）

1. Push 到 GitHub 倉庫
2. 前往 [vercel.com](https://vercel.com) → 點擊 **New Project**
3. 匯入你的 GitHub 倉庫
4. Vercel 會自動偵測為 Vite 項目：
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. 在 **Environment Variables** 中加入：
   - `OPENROUTER_KEYS`: `sk-or-v1-key1,sk-or-v1-key2,sk-or-v1-key3`
   - `OPENROUTER_BASE_URL`: `https://openrouter.ai/api/v1`
6. 點擊 **Deploy**

> Vercel 會自動將 `vercel/adapters/api/chat.ts` 部署到 `/api/chat`。
> 你也可以將該檔案複製到根目錄的 `api/` 目錄手動配置。

#### 方式 2: 使用 Vercel CLI 本地部署

```bash
# 1. 將 API adapter 複製到根 api/ 目錄
cp vercel/adapters/api/chat.ts api/chat.ts

# 2. 設定環境變數
vercel env add OPENROUTER_KEYS
vercel env add OPENROUTER_BASE_URL

# 3. 部署
vercel --prod
```

---

### 方案 B: Netlify 部署

1. Push 到 GitHub 倉庫
2. 前往 [netlify.com](https://netlify.com) → **Add new site** → **Import from GitHub**
3. 選取你的倉庫，Netlify 會自動偵測 `netlify.toml`
4. 在 **Site Settings → Build & Deploy → Environment** 設定：
   - `OPENROUTER_KEYS`: 你的多個 API Keys
   - `OPENROUTER_BASE_URL`: `https://openrouter.ai/api/v1`
   - `VITE_API_ENDPOINT`: `/.netlify/functions/chat`（**重要！**）
5. 點擊 **Deploy site**

---

### 方案 C: Cloudflare Pages 部署

1. Push 到 GitHub 倉庫
2. 前往 [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Pages** → **Connect to Git**
3. 選取你的倉庫，設定 Build command: `npm run build`，Publish directory: `dist`
4. 在 **Variables and secrets** 中加入：
   - `OPENROUTER_KEYS`: 你的多個 API Keys
   - `OPENROUTER_BASE_URL`: `https://openrouter.ai/api/v1`
5. 點擊 **Save and deploy**

> Cloudflare Pages 函數位於 `cloudflare/functions/api/chat.ts`，會自動部署到 `/api/chat` 路徑。

---

## 🔧 環境變數

| 變數名 | 必填 | 預設值 | 說明 |
|--------|------|--------|------|
| `OPENROUTER_KEYS` | ✅ | — | OpenRouter API Keys，逗號分隔 |
| `OPENROUTER_BASE_URL` | ❌ | `https://openrouter.ai/api/v1` | OpenRouter API 基礎 URL |
| `VITE_API_ENDPOINT` | ⚠️ | `/api/chat` | API 端點（Netlify 需設為 `/.netlify/functions/chat`） |

---

## 🤖 可用模型清單

| 模型 | 提供者 | 上下文長度 | 說明 |
|------|--------|-----------|------|
| Nemotron 3 Ultra 550B | NVIDIA | 1M | 550B MoE (55B active)，Transformer-Mamba 混合架構 |
| Nemotron 3.5 Lightning | NVIDIA | 256K | 快速推論變體 |
| Nemotron 3 Super 120B | NVIDIA | 256K | 120B MoE (12B active)，平衡效能與效率 |
| Apodex 1.1 Mini | Apodex | 128K | 輕量高效能模型 |
| Qwen 3.8 27B | Alibaba | 128K | 阿里 Qwen 模型，擅長程式與數學 |
| Ling 3.1 Flash | Inclusion AI | 128K | Inclusion AI 快速模型變體 |
| Inkling | ThinkingMachines | 128K | ThinkingMachines 推理模型 |
| Inkling Small | ThinkingMachines | 128K | Inkling 小型變體 |
| North Mini Code | Cohere | 256K | 30B MoE (3B active)，Apache 2.0 授權，程式專精 |

> 模型清單位於 `shared/models.ts`，可自行新增或移除。

---

## 🔄 API Key 輪詢原理

後端 API 函數每收到一次請求，就會從 `OPENROUTER_KEYS` 列表依序選擇下一個 Key 使用（Round-Robin 演算法）：

```
請求 1 → Key 1
請求 2 → Key 2
請求 3 → Key 3
請求 4 → Key 1  ← 輪回到第一筆
```

這樣可以：
- 分散單個 Key 的請求頻率
- 降低觸發 OpenRouter 限速的機率
- 任一 Key 失效時不影響整體服務

> ⚠️ **注意**：serverless 環境的 in-memory counter 在冷啟動時會重置。這是可接受的行為，因為輪詢邏輯仍然有效。

---

## 📄 技術棧

- **前端**: React 18 + TypeScript + Vite 6
- **樣式**: Tailwind CSS 3
- **字體**: Space Grotesk (標題) + Spline Sans (本體) + JetBrains Mono (等寬)
- **API**: OpenRouter AI API (SSE 串流)
- **部署**: Vercel / Netlify / Cloudflare Pages

---

## 🐛 故障排除

### 「No OpenRouter API keys configured」
確保部署平台的環境變數中已正確設定 `OPENROUTER_KEYS`，且格式為逗號分隔的 Key 列表。

### API 請求失敗
1. 檢查 API Key 是否有效
2. 確認 `OPENROUTER_BASE_URL` 設定正確
3. 檢查部署平台的網路設定（部分平台可能需要 whitelist OpenRouter 域名）

### 模型列表為空或無法切換
確認 `shared/models.ts` 中的模型 ID 與 OpenRouter 平台當前提供的模型 ID 一致。模型 ID 可在 [OpenRouter 模型列表](https://openrouter.ai/models) 查看。

### 本地開發無法調用 API
本地開發時，API 路由需要服務端支持。可透過以下方式解決：
1. 使用 Vercel 的 `vercel dev` 本地預覽
2. 將前端 `client.ts` 中的 `API_PATH` 暫時改為遠端部署的 URL
3. 使用 ngrok 或其他隧道工具暴露本地端口

---

## 📜 License

MIT