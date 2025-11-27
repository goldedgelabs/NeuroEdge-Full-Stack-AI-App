import mod from '../SchedulerAgent';
import { adaptModule } from '../adapterFactory';

const inst = adaptModule(mod, 'SchedulerAgent');
export default inst;
