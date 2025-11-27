import mod from '../OrchestrationAgent';
import { adaptModule } from '../adapterFactory';

const inst = adaptModule(mod, 'OrchestrationAgent');
export default inst;
