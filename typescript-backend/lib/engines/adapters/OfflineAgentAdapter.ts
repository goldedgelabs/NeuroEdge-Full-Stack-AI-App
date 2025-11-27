import mod from '../OfflineAgent';
import { adaptModule } from '../adapterFactory';

const inst = adaptModule(mod, 'OfflineAgent');
export default inst;
