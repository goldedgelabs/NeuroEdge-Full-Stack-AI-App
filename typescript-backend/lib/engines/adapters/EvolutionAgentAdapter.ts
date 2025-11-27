import mod from '../EvolutionAgent';
import { adaptModule } from '../adapterFactory';

const inst = adaptModule(mod, 'EvolutionAgent');
export default inst;
