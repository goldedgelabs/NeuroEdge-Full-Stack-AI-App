import mod from '../HotReloadAgent';
import { adaptModule } from '../adapterFactory';

const inst = adaptModule(mod, 'HotReloadAgent');
export default inst;
