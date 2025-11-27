import mod from '../AutoUpdateAgent';
import { adaptModule } from '../adapterFactory';

const inst = adaptModule(mod, 'AutoUpdateAgent');
export default inst;
