import mod from '../SecurityAgent';
import { adaptModule } from '../adapterFactory';

const inst = adaptModule(mod, 'SecurityAgent');
export default inst;
