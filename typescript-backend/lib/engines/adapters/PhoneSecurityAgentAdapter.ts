import mod from '../PhoneSecurityAgent';
import { adaptModule } from '../adapterFactory';

const inst = adaptModule(mod, 'PhoneSecurityAgent');
export default inst;
