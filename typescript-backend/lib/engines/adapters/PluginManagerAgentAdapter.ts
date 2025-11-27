import mod from '../PluginManagerAgent';
import { adaptModule } from '../adapterFactory';

const inst = adaptModule(mod, 'PluginManagerAgent');
export default inst;
