import mod from '../DidcoveryAgent';
import { adaptModule } from '../adapterFactory';

const inst = adaptModule(mod, 'DidcoveryAgent');
export default inst;
