# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## 常用命令

```bash
npm run dev          # 开发服务器 (localhost:3000)
npm run build        # 生产构建
npm run lint         # ESLint
npm run db:push      # 同步 Prisma schema → SQLite
npm run db:seed      # 导入种子数据（tsx 直接执行 TypeScript）
npm run db:reset     # 重建数据库 + 种子数据
```

## 种子测试账号

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | admin@minimall.com | admin123 |
| 用户 | user@minimall.com | user123 |

## 环境变量 (.env)

- `DATABASE_URL` — SQLite 路径，默认 `file:./dev.db`
- `JWT_SECRET` — JWT 签名密钥，生产环境务必更换

## 架构概览

**全栈范式：** App Router + Server Components + Server Actions。不写 REST API 路由（仅 `/api/upload` 例外）。

### 目录分层

```
lib/              # 基础设施层（被所有层依赖）
  prisma.ts         PrismaClient 单例（Prisma 7 + better-sqlite3 适配器）
  auth.ts           JWT Session 管理（jose + httpOnly Cookie）
  password.ts       bcrypt 加盐哈希
  upload.ts         文件保存工具

app/actions/       # Server Actions（`"use server"`，服务端数据操作）
  auth.ts           注册/登录/登出
  products.ts       商品搜索/详情/推荐
  cart.ts           购物车 CRUD
  orders.ts         下单/我的订单/模拟支付
  admin/            后台操作的 actions（products/categories/orders）

app/               # 页面 & 布局
  layout.tsx        根布局（Navbar + Footer）+ Metadata
  admin/layout.tsx  后台布局（AdminSidebar + requireAdmin 守卫）
  api/upload/       唯一 API Route — 文件上传（POST multipart）

components/        # UI 组件（按领域分目录）
  layout/           Navbar, Footer, AdminSidebar
  product/          ProductCard, ProductGrid, SearchBar
  cart/             CartItemRow, CartSummary
  admin/            ProductForm, StatsCard, OrderStatusBadge
```

### Server Component 数据流

1. 页面是 async Server Component，直接调用 Server Action / lib 函数读取数据
2. 表单提交用 `<form action={serverAction}>` 或 Client Component 中手动调用 action
3. `getSession()` / `requireAuth()` / `requireAdmin()` 在 Server Component 中调用完成鉴权
4. 鉴权失败自动 `redirect()`，不渲染受保护内容

### 认证流程

- JWT 通过 `jose` 签发/验证，payload 包含 `{ userId, email, role }`
- token 存储在 `mini-mall-token` httpOnly Cookie（7 天有效）
- `lib/auth.ts` 暴露：`getSession()`, `requireAuth()`, `requireAdmin()`, `setSession()`, `clearSession()`
- Server Actions 防 CSRF：每个 action 内部调用 `getSession()` 校验身份

### Prisma 注意事项

- **Prisma 7**：`url` 不在 schema.prisma 中配置，统一在 `prisma.config.ts` 的 `datasource.url` 中指定
- **适配器**：SQLite 需要 `@prisma/adapter-better-sqlite3`，实例化时传给 PrismaClient constructor
- **客户端导入路径**：`import { PrismaClient } from "@/app/generated/prisma/client"`（不是 `@prisma/client`）
- **Schema 变更后**：运行 `prisma db push`（无 migrations）或 `prisma generate` 重新生成客户端
- `serverExternalPackages: ["better-sqlite3"]` 在 next.config.ts 中配置，避免 Turbopack 打包原生模块

### UI 约定

- 活力电商风格，CSS 变量定义在 `globals.css` 的 `:root` 中，通过 `@theme inline` 注册为 Tailwind 类
- 自定义工具类：`.btn-primary`, `.btn-accent`, `.btn-outline`, `.card`, `.badge-*`, `.input-field`, `.form-label`, `.form-error`
- `input-field` 统一所有输入框样式，错误态加 `input-error` 类
- 响应式：Tailwind 断点 `sm/md/lg/xl`，商品卡片网格 1→2→3→4 列

### OrderItem 商品快照

- 下单时 `OrderItem` 冗余存储 `productName` 和 `productPrice`，后续商品改名/改价不影响历史订单
- Order 状态流转：`PENDING → PAID → SHIPPED → DELIVERED`，任一状态可转 `CANCELLED`
- CartItem 使用 `@@unique([userId, productId])`，同商品加购只增加数量不重复插行
