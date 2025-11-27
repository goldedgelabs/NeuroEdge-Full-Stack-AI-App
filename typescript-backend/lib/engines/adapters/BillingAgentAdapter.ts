import mod from '../BillingAgent';
import { adaptModule } from '../adapterFactory';

const inst = adaptModule(mod, 'BillingAgent');
export default inst;
