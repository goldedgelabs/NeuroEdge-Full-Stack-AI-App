# neuroedge_extensions.py
# Lightweight extensions for NeuroEdge core:
# - mounts a minimal operator UI at /operator
# - starts a periodic checkpoint save/load mechanism
# - integrates with neuroedge_agent_registry for agent creation (best-effort)

import asyncio, os, pickle, time, logging
from fastapi.staticfiles import StaticFiles

logger = logging.getLogger('neuroedge_extensions')

try:
    from neuroedge_autonomous import app, orch
except Exception as e:
    logger.exception('could not import neuroedge core: %s', e)
    raise

# mount static operator UI
_static_path = os.path.join(os.path.dirname(__file__), 'static')
if os.path.isdir(_static_path):
    try:
        app.mount('/operator', StaticFiles(directory=_static_path), name='operator')
        logger.info('Operator UI mounted at /operator')
    except Exception as e:
        logger.exception('Failed to mount static UI: %s', e)

# Checkpointing: persist small state periodically
CHECKPOINT_FILE = os.path.join(os.path.dirname(__file__), 'neuroedge_checkpoint.pkl')

async def save_checkpoint_loop():
    await asyncio.sleep(1)  # allow app startup first
    while True:
        try:
            state = {
                'vectors_meta': {vid: {'usage': orch.vm.usage.get(vid,0), 'shared': orch.vm.shared.get(vid, False), 'last_used': orch.vm.last_used.get(vid,0), 'importance': orch.vm.importance.get(vid,0), 'retention': orch.vm.retention.get(vid,0)} for vid in orch.vm.vectors.keys()},
                'agent_scores': orch.am.scores,
                'timestamp': time.time()
            }
            with open(CHECKPOINT_FILE + '.tmp', 'wb') as f:
                pickle.dump(state, f)
            os.replace(CHECKPOINT_FILE + '.tmp', CHECKPOINT_FILE)
            logger.info('NeuroEdge checkpoint saved (%d vectors)', len(state['vectors_meta']))
        except Exception as e:
            logger.exception('checkpoint save failed: %s', e)
        await asyncio.sleep(30)  # checkpoint every 30s

def load_checkpoint():
    try:
        if os.path.exists(CHECKPOINT_FILE):
            with open(CHECKPOINT_FILE, 'rb') as f:
                state = pickle.load(f)
            vm = orch.vm
            for vid, meta in state.get('vectors_meta', {}).items():
                # don't overwrite vectors themselves, just metadata like usage/importance/retention
                if vid in vm.vectors:
                    vm.usage[vid] = meta.get('usage', vm.usage.get(vid,0))
                    vm.shared[vid] = meta.get('shared', vm.shared.get(vid, False))
                    vm.last_used[vid] = meta.get('last_used', vm.last_used.get(vid, time.time()))
                    vm.importance[vid] = meta.get('importance', vm.importance.get(vid,0.5))
                    vm.retention[vid] = meta.get('retention', vm.retention.get(vid,0.5))
            orch.am.scores.update(state.get('agent_scores', {}))
            logger.info('Loaded NeuroEdge checkpoint with %d vectors', len(state.get('vectors_meta', {})))
    except Exception as e:
        logger.exception('load checkpoint failed: %s', e)

# startup/shutdown hooks
@app.on_event('startup')
async def _ne_on_startup():
    # load checkpoint if exists
    load_checkpoint()
    # start background checkpoint task
    try:
        loop = asyncio.get_event_loop()
        loop.create_task(save_checkpoint_loop())
    except Exception as e:
        logger.exception('failed to start checkpoint loop: %s', e)
