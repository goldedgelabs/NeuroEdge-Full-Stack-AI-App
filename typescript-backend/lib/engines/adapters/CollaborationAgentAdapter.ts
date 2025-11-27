import mod from '../CollaborationAgent';
import { adaptModule } from '../adapterFactory';

const inst = adaptModule(mod, 'CollaborationAgent');
export default inst;
