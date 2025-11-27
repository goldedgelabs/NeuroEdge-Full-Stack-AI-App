import mod from '../AntiTheftAgent';
import { adaptModule } from '../adapterFactory';

const inst = adaptModule(mod, 'AntiTheftAgent');
export default inst;
