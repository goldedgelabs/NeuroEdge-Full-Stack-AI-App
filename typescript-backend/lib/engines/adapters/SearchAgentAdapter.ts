import mod from '../SearchAgent';
import { adaptModule } from '../adapterFactory';

const inst = adaptModule(mod, 'SearchAgent');
export default inst;
