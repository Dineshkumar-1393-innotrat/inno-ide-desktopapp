import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, createHashRouter, RouterProvider } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App";
import theme from "./theme";
import "./components/RuleEngine/styles/index.css";
import '@dytesdk/ui-kit/dist/collection/components/dyte-ui-provider/dyte-ui-provider.css';
import '@dytesdk/ui-kit/dist/collection/components/dyte-meeting/dyte-meeting.css';
import '@dytesdk/ui-kit/dist/collection/components/dyte-grid/dyte-grid.css';
import '@dytesdk/ui-kit/dist/collection/components/dyte-controlbar/dyte-controlbar.css';
import '@dytesdk/ui-kit/dist/collection/components/dyte-participant/dyte-participant.css';
import '@dytesdk/ui-kit/dist/collection/components/dyte-participants/dyte-participants.css';
import '@dytesdk/ui-kit/dist/collection/components/dyte-mic-toggle/dyte-mic-toggle.css';
import '@dytesdk/ui-kit/dist/collection/components/dyte-camera-toggle/dyte-camera-toggle.css';
import '@dytesdk/ui-kit/dist/collection/components/dyte-screen-share-toggle/dyte-screen-share-toggle.css';
import '@dytesdk/ui-kit/dist/collection/components/dyte-leave-button/dyte-leave-button.css';
import '@dytesdk/ui-kit/dist/collection/components/dyte-setup-screen/dyte-setup-screen.css';
import { createTheme, ThemeProvider as MUIThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/store';
import { isElectron } from "./platform";

const muiTheme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
});

const routes = [
  {
    path: "/*",
    element: <App />,
  },
];

const routerOptions = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

const isFileProtocol = typeof window !== "undefined" && window.location.protocol === "file:";
const router = (isElectron || isFileProtocol)
  ? createHashRouter(routes, routerOptions)
  : createBrowserRouter(routes, routerOptions);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <GoogleOAuthProvider
          clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
          onScriptLoadError={(err) => console.error('Google OAuth script failed to load:', err)}
        >
          <ChakraProvider theme={theme}>
            <StyledEngineProvider injectFirst>
              <MUIThemeProvider theme={muiTheme}>
                <RouterProvider router={router} />
              </MUIThemeProvider>
            </StyledEngineProvider>
          </ChakraProvider>
        </GoogleOAuthProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
