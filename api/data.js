const DATA_KEY = process.env.DATA_KEY || 'broadcast-equipment-system:data';

const EMPTY_DATA = {
  items: [],
  locations: [],
  loans: [],
  history: [],
  floorplan: '',
  nextItem: 1,
  nextLocation: 1,
  nextLoan: 1
};

function redisConfig() {
  return {
    url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  };
}

async function redisCommand(command) {
  const { url, token } = redisConfig();
  if (!url || !token) {
    throw new Error('Redis integration is not connected');
  }

  const response = await fetch(`${url}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify([command])
  });

  if (!response.ok) {
    throw new Error(`Redis HTTP ${response.status}`);
  }

  const result = await response.json();
  if (result[0]?.error) {
    throw new Error(result[0].error);
  }
  return result[0]?.result;
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  try {
    if (req.method === 'GET') {
      const raw = await redisCommand(['GET', DATA_KEY]);
      return res.status(200).json(raw ? JSON.parse(raw) : EMPTY_DATA);
    }

    if (req.method === 'POST') {
      const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      await redisCommand(['SET', DATA_KEY, JSON.stringify(data || EMPTY_DATA)]);
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({
      error: 'Data API error',
      message: error.message
    });
  }
};
