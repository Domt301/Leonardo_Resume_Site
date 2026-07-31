import { createBrowserRouter } from 'react-router-dom';
import App from './App';

// All paths render the same shell; panels are route-driven overlays parsed by
// useRoutePanel/parseRoute (spec §18). The catch-all also covers the 404 panel.
export const router = createBrowserRouter([{ path: '*', element: <App /> }]);
