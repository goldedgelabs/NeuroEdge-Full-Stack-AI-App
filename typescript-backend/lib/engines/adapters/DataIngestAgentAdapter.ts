import mod from '../DataIngestAgent';
import { adaptModule } from '../adapterFactory';

const inst = adaptModule(mod, 'DataIngestAgent');
export default inst;
