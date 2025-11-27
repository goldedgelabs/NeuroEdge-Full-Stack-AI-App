import mod from '../SecurityCheckAgent';
import { adaptModule } from '../adapterFactory';

const inst = adaptModule(mod, 'SecurityCheckAgent');
export default inst;
