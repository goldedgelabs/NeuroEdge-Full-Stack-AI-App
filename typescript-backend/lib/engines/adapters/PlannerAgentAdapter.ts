import mod from '../PlannerAgent';
import { adaptModule } from '../adapterFactory';

const inst = adaptModule(mod, 'PlannerAgent');
export default inst;
