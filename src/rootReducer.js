import { combineReducers } from 'redux';

const counter = (state = 0, action) => {
  if (action.type === 'INCREASE_COUNTER') {
    return state + action.payload;
  }

  return state;
}


export default combineReducers({
  counter,
});
