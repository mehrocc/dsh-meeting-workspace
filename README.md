# DSH 会议纪要工作台

在 DSH Desktop 中安排会议、记录音频和逐字稿、整理纪要，并从历史会议跟进任务。支持导入飞书妙记、文本逐字稿和音视频，会议助手沿用 DSH 会话。

## 安装与使用

从本仓库 Release 下载工作台安装包，在 DSH Desktop 的工作台管理中安装，并按提示重启 Harness。录音组件适用于 Apple Silicon Mac，原生双路录音需要 macOS 14.2 或更新版本。其他平台尚待验证。

首次打开时选择你自己的会议资料文件夹。日程可手动添加、从会议邀请解析或同步 Mac 日历。到点提醒和会议检测只发出确认提示，录音由用户主动开始。按需要允许麦克风、系统录音和日历权限。

没有单独安装 X-ASR 资源时，默认使用 DSH 的 SenseVoiceSmall，在工作台设置中准备语音模型后可以分段转写。X-ASR 流式转写和会后发言人区分需要独立模型资源，本安装包不含这些模型。飞书妙记导入需要安装官方 lark-cli，并对指定妙记授权。

音频和会议资料保存在所选文件夹。使用 AI 摘要或会议助手时，相关会议文字会发送给在 DSH 中选用的模型服务，费用按该服务的配置计算。纯本地录音和本地转写不使用云端模型。卸载工作台后，会议资料文件夹保留。

## 开发

准备 Node.js、npm 和 pnpm，运行 `npm ci`、`npm run build`、`npm test` 和 `npm run check`。使用 `npm run pack:local` 生成安装包。重建原生录音组件需要 Apple Silicon Mac 和 Xcode Command Line Tools，可运行 `npm run build:native`。
