import { AuthProvider } from "./providers/AuthProvider.jsx";
import { MsAuthProvider } from "./providers/MsAuthProvider.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { HomePage } from "./pages/HomePage.jsx";
import { Layout } from "./components/Layout/Layout.jsx";
import { ProductsPage } from "./pages/products/ProductsPage/ProductsPage.jsx";
import { UsersPage } from "./pages/UsersPage/UsersPage.jsx";
import { RoleGuard } from "./components/RoleGuard.jsx";
import { CompaniesPage } from "./pages/companies/CompaniesPage/CompaniesPage.jsx";
import { ProductDetailPage } from "./pages/products/ProductDetailPage/ProductDetailPage.jsx";
import { CompanyPage } from "./pages/companies/CompanyPage/CompanyPage.jsx";
import { SnackbarProvider } from "notistack";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/products",
        element: <ProductsPage />,
      },
      {
        path: "/companies",
        element: <CompaniesPage />,
      },
      {
        path: "/companies/:id",
        element: <CompanyPage />,
      },
      {
        path: "/admin/users",
        element: (
          <RoleGuard requiredRole="admin">
            <UsersPage />
          </RoleGuard>
        ),
      },
      {
        path: "/products/:id",
        element: <ProductDetailPage />,
      },
    ],
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MsAuthProvider>
        <AuthProvider>
          <SnackbarProvider>
            <RouterProvider router={router} />
          </SnackbarProvider>
        </AuthProvider>
      </MsAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
