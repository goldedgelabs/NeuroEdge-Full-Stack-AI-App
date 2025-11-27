import mod from '../EdgeDeviceAgent';
import { adaptModule } from '../adapterFactory';

const inst = adaptModule(mod, 'EdgeDeviceAgent');
export default inst;
