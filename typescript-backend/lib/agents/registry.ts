// Auto-generated agents registry
import fs from 'fs';
import path from 'path';

const agents: Record<string, any> = {};
const dir = path.join(__dirname, '..', 'agents');
if (fs.existsSync(dir)) {
  for (const f of fs.readdirSync(dir)) {
    if (f.endsWith('.ts') || f.endsWith('.js')) {
      const name = f.replace(/\.ts$|\.js$/,'');
      try { agents[name] = require('./agents/' + name).default || require('./agents/' + name); } catch(e) { agents[name] = null; }
    }
  }
}

export default agents;
