
# Example ingestion worker: pulls from Redis, writes metadata to Postgres and embedding to Qdrant
# pip install asyncpg aioredis requests
import asyncio, os, json, asyncpg, aioredis, requests, time

REDIS_URL = os.environ.get('REDIS_URL','${REDIS_URL:-redis://localhost:6379}')
DATABASE_URL = os.environ.get('DATABASE_URL','postgresql://${DB_USER:-__DB_USER__}:${DB_PASSWORD:-__DB_PASSWORD__}@${DB_HOST:-localhost}:${DB_PORT:-5432}/${DB_NAME:-neuroedge}')
QDRANT_URL = os.environ.get('QDRANT_URL','${QDRANT_URL:-http://localhost:6333}')

async def worker():
    pool = await asyncpg.create_pool(DATABASE_URL)
    r = await aioredis.from_url(REDIS_URL)
    while True:
        item = await r.rpop('vector_ingest')
        if not item:
            await asyncio.sleep(0.2); continue
        task = json.loads(item)
        # write metadata to Postgres and insert without embedding
        async with pool.acquire() as conn:
            await conn.execute('INSERT INTO vectors_base (tenant_id, key, embedding, metadata) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING', task.get('tenant_id'), task['key'], [0.0]*1536, json.dumps(task.get('metadata',{})))
        # push embedding to qdrant in collection 'neuroedge_vectors'
        payload = {
            "points": [
                {"id": task['key'], "vector": task['embedding'], "payload": task.get('metadata', {})}
            ]
        }
        try:
            requests.put(f"{QDRANT_URL}/collections/neuroedge_vectors/points", json=payload, timeout=10)
        except Exception as e:
            print("qdrant push error", e)
        print("ingested", task['key'])

if __name__ == '__main__':
    asyncio.run(worker())
