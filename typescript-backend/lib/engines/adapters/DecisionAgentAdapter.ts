import mod from '../DecisionAgent';
import { adaptModule } from '../adapterFactory';

const inst = adaptModule(mod, 'DecisionAgent');
export default inst;
