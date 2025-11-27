import mod from '../FounderAgent';
import { adaptModule } from '../adapterFactory';

const inst = adaptModule(mod, 'FounderAgent');
export default inst;
