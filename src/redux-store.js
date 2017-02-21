import { createStore } from 'redux';
import rootReducer from './rootReducer';

export default () => {
  const store = createStore(rootReducer);
  return store;
}
