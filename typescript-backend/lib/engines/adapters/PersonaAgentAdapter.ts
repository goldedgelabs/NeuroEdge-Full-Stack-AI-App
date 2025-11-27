import mod from '../PersonaAgent';
import { adaptModule } from '../adapterFactory';

const inst = adaptModule(mod, 'PersonaAgent');
export default inst;
