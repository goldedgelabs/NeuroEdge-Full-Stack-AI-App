import mod from '../PluginAgent';
import { adaptModule } from '../adapterFactory';

const inst = adaptModule(mod, 'PluginAgent');
export default inst;
