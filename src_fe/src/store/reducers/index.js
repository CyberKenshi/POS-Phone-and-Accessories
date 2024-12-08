import { combineReducers } from 'redux';
import auth from 'contexts/auth-reducer/auth';

const rootReducer = combineReducers({
  auth
});

export default rootReducer;
