import mod from '../GPUAgent';
import { adaptModule } from '../adapterFactory';

const inst = adaptModule(mod, 'GPUAgent');
export default inst;
