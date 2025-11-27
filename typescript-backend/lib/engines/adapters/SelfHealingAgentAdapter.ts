import mod from '../SelfHealingAgent';
import { adaptModule } from '../adapterFactory';

const inst = adaptModule(mod, 'SelfHealingAgent');
export default inst;
