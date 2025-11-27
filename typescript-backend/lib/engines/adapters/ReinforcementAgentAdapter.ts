import mod from '../ReinforcementAgent';
import { adaptModule } from '../adapterFactory';

const inst = adaptModule(mod, 'ReinforcementAgent');
export default inst;
