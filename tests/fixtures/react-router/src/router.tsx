import { createBrowserRouter } from 'react-router-dom';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/about',
    element: <About />,
  },
  {
    path: '/products',
    element: <Products />,
    children: [
      {
        path: ':productId',
        element: <ProductDetail />,
      },
    ],
  },
  {
    path: '/settings',
    element: <Settings />,
  },
]);
