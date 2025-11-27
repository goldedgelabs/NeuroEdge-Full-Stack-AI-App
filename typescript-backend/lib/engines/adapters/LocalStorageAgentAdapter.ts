import mod from '../LocalStorageAgent';
import { adaptModule } from '../adapterFactory';

const inst = adaptModule(mod, 'LocalStorageAgent');
export default inst;
