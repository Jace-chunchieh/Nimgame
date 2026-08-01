# XOR NIM · 量子异或竞技场

基于经典尼姆博弈（Nim Game）的移动端策略益智游戏。通过二进制异或（XOR）判断局面优势，与 AI 回合制对战，制造 XOR = 0 的必胜局面。

需求文档：`Nimgame_doc.txt`（PRD V1.0）

## 技术栈

- Vue 3 + TypeScript + Pinia + Vite
- 动画：GSAP + CSS（粒子系统为自研 Canvas 2D 轻量实现，满足 60 FPS 与 <150 粒子限制）
- 音效：WebAudio 程序化合成（无外部音频文件，可平滑替换 Howler.js）
- PWA：manifest + Service Worker（可安装到手机桌面）

## 快速开始

```bash
npm install
npm run dev       # 开发模式 http://localhost:5173
npm run build     # 生产构建 → dist/
npm run preview   # 预览生产构建
npm test          # 引擎逻辑自测
```

手机访问：开发服务器已开启 `host: true`，手机与电脑同一局域网时访问 `http://<电脑IP>:5173`。

## 功能清单（MVP，对应 PRD 第 15 节）

- 人机对战（3~5 阵列 × 1~15 核心，可配置，玩家先手可选）
- 三档 AI：简单（20% 最优）/ 普通（70% 最优）/ 困难（必胜算法）
- 双人对战（Hot-seat：同一设备 P1/P2 轮流操作，无合法操作者判负，胜者计入战绩）
- 尼姆规则引擎 + XOR 计算（`src/engine/`）
- 二进制实时展示 + 位视图展开（奇数个 1 → 1）
- 滑动选择移除核心 + XOR 实时预览（"系统即将稳定" 提示）
- 核心吸收飞行动画 / XOR 核心状态变化（橙红不稳定 ↔ 青绿稳定）/ AI 思考动画 / 胜负动画
- 本地战绩（胜/负/胜率、历史记录含策略评分、最优操作数、关键失误与建议）
- 闯关模式（6 关逐步学习异或策略，进度本地持久化）
- 教学模式 / 设置（难度、参数、音效、震动、低性能模式）

## 核心算法

困难 AI（`src/engine/nimAI.ts`）：

```
NimSum = A1 ⊕ A2 ⊕ … ⊕ An
若 NimSum ≠ 0：
  target = pile ⊕ NimSum（target < pile 的堆）
  remove = pile − target  →  使 NimSum = 0
```
