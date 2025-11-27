import mod from '../ARVAgent';
import { adaptModule } from '../adapterFactory';

const inst = adaptModule(mod, 'ARVAgent');
export default inst;
