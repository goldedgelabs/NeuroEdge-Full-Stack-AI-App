import mod from '../CriticAgent';
import { adaptModule } from '../adapterFactory';

const inst = adaptModule(mod, 'CriticAgent');
export default inst;
