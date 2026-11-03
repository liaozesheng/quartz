---
title: SenseVoice 语音识别服务部署
tags:
  - 运维
  - 部署
category: 09-自动化与部署
status: done
---

# SenseVoice 语音识别服务部署

## 背景

阿里通义实验室开源的多语言语音理解模型，替代 Hermes 默认的 faster-whisper STT，提升中文识别效果。

## 环境

- 系统：Ubuntu 24.04 LTS
- 服务：FunASR Server
- 版本：funasr 1.3.14, SenseVoice-Small
- 端口：8000
- 依赖：Python 3.12, PyTorch (CPU), torchaudio

## 部署步骤

### 1. 环境准备

```bash
# 安装依赖
sudo apt-get install -y python3-pip python3.12-venv

# 创建虚拟环境
python3 -m venv ~/sensevoice-env
source ~/sensevoice-env/bin/activate
```

### 2. 安装依赖包

```bash
pip3 install -i https://mirrors.aliyun.com/pypi/simple/ --trusted-host mirrors.aliyun.com \
  funasr modelscope torch torchaudio \
  fastapi uvicorn python-multipart
```

### 3. 下载模型

```python
from modelscope import snapshot_download
model_dir = snapshot_download('iic/SenseVoiceSmall')
```

### 4. 启动服务

```bash
nohup funasr-server --model sensevoice --device cpu --host 0.0.0.0 --port 8000 > /tmp/sensevoice-server.log 2>&1 &
```

## 配置文件

Hermes STT 配置：

```bash
hermes config set stt.provider openai
hermes config set stt.openai.base_url "http://192.168.71.212:8000/v1"
hermes config set stt.openai.model sensevoice
```

## 验证方法

```bash
# 检查服务状态
curl http://192.168.71.212:8000/v1/models

# 测试转录
curl -X POST http://192.168.71.212:8000/v1/audio/transcriptions \
  -F "model=sensevoice" \
  -F "file=@audio.wav"
```

## 回滚方法

```bash
# 停止服务
pkill -f funasr-server

# 恢复 faster-whisper
hermes config set stt.provider local
hermes config set stt.local.model base
```

## 常见问题

| 问题 | 排查方向 | 解决方法 |
|---|---|---|
| 服务无法启动 | 检查端口占用 | `lsof -i :8000` 并 kill 进程 |
| 模型加载失败 | 检查模型缓存 | `~/.cache/modelscope/models/iic--SenseVoiceSmall/` |
| API 无响应 | 检查防火墙 | 放行 8000 端口 |
| 内存不足 | 检查内存占用 | SenseVoice 需要 ~2GB 内存 |

## 相关笔记

- [[个人局域网环境]]
