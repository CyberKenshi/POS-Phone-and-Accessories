import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';

// project import
import router from 'routes';
import ThemeCustomization from 'themes';

import ScrollTop from 'components/ScrollTop';
import { SnackbarProvider } from 'notistack';

// ==============================|| APP - THEME, ROUTER, LOCAL ||============================== //

export default function App() {
  return (
    <Provider store={store}>
      <ThemeCustomization>
        <SnackbarProvider maxSnack={3}>
          <ScrollTop>
            <RouterProvider router={router} />
          </ScrollTop>
        </SnackbarProvider>
      </ThemeCustomization>
    </Provider>
  );
}
