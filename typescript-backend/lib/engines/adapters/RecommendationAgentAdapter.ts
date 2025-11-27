import mod from '../RecommendationAgent';
import { adaptModule } from '../adapterFactory';

const inst = adaptModule(mod, 'RecommendationAgent');
export default inst;
