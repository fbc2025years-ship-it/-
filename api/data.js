const { neon } = require('@neondatabase/serverless');

const DATA_KEY = process.env.DATA_KEY || 'broadcast-equipment-system';
const DATABASE_URL =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.NEON_DATABASE_URL;

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

function getSql() {
  if (!DATABASE_URL) {
    throw new Error('Neon Postgres is not connected. DATABASE_URL is missing.');
  }
  return neon(DATABASE_URL);
}

async function ensureTable(sql) {
  await sql`
    create table if not exists app_data (
      key text primary key,
      value jsonb not null,
      updated_at timestamptz not null default now()
    )
  `;
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  try {
    const sql = getSql();
    await ensureTable(sql);

    if (req.method === 'GET') {
      const rows = await sql`
        select value
        from app_data
        where key = ${DATA_KEY}
        limit 1
      `;
      return res.status(200).json(rows[0]?.value || EMPTY_DATA);
    }

    if (req.method === 'POST') {
      const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      await sql`
        insert into app_data (key, value, updated_at)
        values (${DATA_KEY}, ${JSON.stringify(data || EMPTY_DATA)}::jsonb, now())
        on conflict (key)
        do update set value = excluded.value, updated_at = now()
      `;
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

