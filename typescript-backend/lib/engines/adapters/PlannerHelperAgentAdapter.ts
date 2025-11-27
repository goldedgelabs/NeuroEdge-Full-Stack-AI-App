import mod from '../PlannerHelperAgent';
import { adaptModule } from '../adapterFactory';

const inst = adaptModule(mod, 'PlannerHelperAgent');
export default inst;
