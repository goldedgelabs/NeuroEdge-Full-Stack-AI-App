import mod from '../AgentBase';
import { adaptModule } from '../adapterFactory';

const inst = adaptModule(mod, 'AgentBase');
export default inst;
