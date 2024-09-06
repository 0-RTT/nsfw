本项目使用了 [nsfwjs](https://github.com/infinitered/nsfwjs) 提供的模型进行内容审核。

一键安装

```
bash -c "$(curl -L https://raw.githubusercontent.com/0-RTT/index/main/nsfw.sh)" @ install
```

一键卸载

```
bash -c "$(curl -L https://raw.githubusercontent.com/0-RTT/index/main/nsfw.sh)" @ remove
```

配置nginx反代

```
    
    location / {
        proxy_pass http://127.0.0.1:9740;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
```

用户可以通过以下格式的请求获取结果```GET https://example.com/nsfw?url=https://telegra.ph/file/e6ae6329a5ee2f64acd06.jpg```

API 将返回一个 JSON 对象,具体请参考[nsfw_model](https://github.com/GantMan/nsfw_model)

```
{
  "Neutral": 0.8800620436668396,
  "Porn": 0.08365660905838013,
  "Hentai": 0.018338331952691078,
  "Drawing": 0.012442261911928654,
  "Sexy": 0.005500736180692911
}
```

