import mod from '../agentEngineBridge';
import { adaptModule } from '../adapterFactory';

const inst = adaptModule(mod, 'agentEngineBridge');
export default inst;
