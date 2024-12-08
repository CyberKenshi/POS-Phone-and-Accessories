// action - state management
import { REGISTER, LOGIN, LOGOUT, SET_TOKEN } from './actions';

// initial state
export const initialState = {
  isLoggedIn: false,
  isInitialized: false,
  user: null,
  token: null
};

// ==============================|| AUTH REDUCER ||============================== //

const auth = (state = initialState, action) => {
  switch (action.type) {
    case REGISTER: {
      const { user } = action.payload;
      return {
        ...state,
        user
      };
    }
    case LOGIN: {
      const { user, token } = action.payload;
      return {
        ...state,
        isLoggedIn: true,
        isInitialized: true,
        user,
        token
      };
    }
    case LOGOUT: {
      return {
        ...state,
        isInitialized: true,
        isLoggedIn: false,
        user: null,
        token: null
      };
    }
    case SET_TOKEN: {
      return {
        ...state,
        token: action.payload
      };
    }
    default: {
      return { ...state };
    }
  }
};

export default auth;
