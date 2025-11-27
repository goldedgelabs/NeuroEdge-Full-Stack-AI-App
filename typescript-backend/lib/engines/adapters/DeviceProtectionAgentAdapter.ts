import mod from '../DeviceProtectionAgent';
import { adaptModule } from '../adapterFactory';

const inst = adaptModule(mod, 'DeviceProtectionAgent');
export default inst;
