// api/weather.js
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  try {
    // 1. 读取环境变量
    const projectId = process.env.QWEATHER_PROJECT_ID;
    const keyId = process.env.QWEATHER_KEY_ID;
    const privateKey = process.env.QWEATHER_PRIVATE_KEY;
    const developerId = process.env.QWEATHER_DEVELOPER_ID;

    // 2. 检查环境变量是否齐全
    if (!projectId || !keyId || !privateKey || !developerId) {
      return res.status(500).json({ 
        error: '环境变量缺失',
        missing: {
          projectId: !projectId,
          keyId: !keyId,
          privateKey: !privateKey,
          developerId: !developerId
        }
      });
    }

    // 3. 生成 JWT
    const token = jwt.sign(
      {
        iss: developerId,      // ✅ 开发者 ID（Q 开头）
        sub: projectId,        // ✅ 项目 ID
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000) - 30
      },
      privateKey,
      {
        algorithm: 'EdDSA',
        header: { alg: 'EdDSA', kid: keyId }  // ✅ 凭据 ID
      }
    );

    // 4. 获取城市，优先用 URL 参数，否则用 Vercel 自动识别的城市
    let location = req.query.location;
    if (!location) {
      const cityHeader = req.headers['x-vercel-ip-city'];
      if (cityHeader) {
        location = decodeURIComponent(cityHeader);
      }
    }
    // 兜底：默认北京
    if (!location) {
      location = '101010100';
    }

    // 5. 请求和风天气
    const apiUrl = `https://api.qweather.com/v7/weather/now?location=${location}&key=${token}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    // 6. 返回数据
    res.status(200).json(data);

  } catch (error) {
    // 把错误信息返回，方便调试
    res.status(500).json({ 
      error: '函数执行失败', 
      message: error.message,
      stack: error.stack 
    });
  }
}
