import mod from '../MemoryAgent';
import { adaptModule } from '../adapterFactory';

const inst = adaptModule(mod, 'MemoryAgent');
export default inst;
