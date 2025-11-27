import mod from '../DoctrineAgent';
import { adaptModule } from '../adapterFactory';

const inst = adaptModule(mod, 'DoctrineAgent');
export default inst;
