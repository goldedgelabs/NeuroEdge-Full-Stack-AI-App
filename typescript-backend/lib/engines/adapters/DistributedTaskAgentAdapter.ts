import mod from '../DistributedTaskAgent';
import { adaptModule } from '../adapterFactory';

const inst = adaptModule(mod, 'DistributedTaskAgent');
export default inst;
