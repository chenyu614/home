// api/weather.js
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  // 从 Vercel 环境变量中读取敏感信息
  const projectId = process.env.QWEATHER_PROJECT_ID;
  const keyId = process.env.QWEATHER_KEY_ID;
  const privateKey = process.env.QWEATHER_PRIVATE_KEY;

  // 生成 JWT（有效期设为 1 小时）
  const token = jwt.sign(
    {
      iss: projectId,
      sub: projectId,
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000) - 30
    },
    privateKey,
    {
      algorithm: 'EdDSA',
      header: { alg: 'EdDSA', kid: keyId }
    }
  );

  // 接收前端传来的经纬度或城市ID
  const { location } = req.query;
  
  // 请求和风天气接口（这里以实时天气为例）
  const apiUrl = `https://api.qweather.com/v7/weather/now?location=${location}&key=${token}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weather' });
  }
}
