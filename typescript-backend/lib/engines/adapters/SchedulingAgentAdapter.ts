import mod from '../SchedulingAgent';
import { adaptModule } from '../adapterFactory';

const inst = adaptModule(mod, 'SchedulingAgent');
export default inst;
