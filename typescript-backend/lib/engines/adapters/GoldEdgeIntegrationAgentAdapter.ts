import mod from '../GoldEdgeIntegrationAgent';
import { adaptModule } from '../adapterFactory';

const inst = adaptModule(mod, 'GoldEdgeIntegrationAgent');
export default inst;
