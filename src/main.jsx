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

const appContent = (
  <ChakraProvider theme={theme}>
    <StyledEngineProvider injectFirst>
      <MUIThemeProvider theme={muiTheme}>
        <RouterProvider router={router} />
      </MUIThemeProvider>
    </StyledEngineProvider>
  </ChakraProvider>
);

class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[RootErrorBoundary] Caught fatal render error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px',
          fontFamily: 'Segoe UI, -apple-system, BlinkMacSystemFont, sans-serif',
          backgroundColor: '#0f172a',
          color: '#f8fafc',
          minHeight: '100vh',
          boxSizing: 'border-box'
        }}>
          <h2 style={{ color: '#ef4444', marginBottom: '16px' }}>Application Initialization Error</h2>
          <p style={{ color: '#94a3b8', marginBottom: '24px' }}>
            InnoIDE encountered an unexpected issue while mounting the interface:
          </p>
          <pre style={{
            background: '#1e293b',
            padding: '16px',
            borderRadius: '8px',
            color: '#fca5a5',
            overflowX: 'auto',
            fontSize: '13px',
            border: '1px solid #334155'
          }}>
            {String(this.state.error?.stack || this.state.error?.message || this.state.error)}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Reload Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
            <GoogleOAuthProvider
              clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
              onScriptLoadError={(err) => console.warn('Google OAuth script failed to load:', err)}
            >
              {appContent}
            </GoogleOAuthProvider>
          ) : (
            appContent
          )}
        </PersistGate>
      </Provider>
    </RootErrorBoundary>
  </React.StrictMode>
);
