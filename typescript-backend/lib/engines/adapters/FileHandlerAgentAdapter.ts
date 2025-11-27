import mod from '../FileHandlerAgent';
import { adaptModule } from '../adapterFactory';

const inst = adaptModule(mod, 'FileHandlerAgent');
export default inst;
