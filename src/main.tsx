import { AuthProvider } from "./contexts/AuthContext";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

import SiteLayout from "./components/SiteLayout";
import AboutPage from "./pages/AboutPage";
import AdminManagementPage from "./pages/AdminManagementPage";
import EmployeeGate from "./components/EmployeeGate";
import EmployeeAccessPage from "./pages/EmployeeAccessPage";
import ApiDirectoryPage from "./pages/ApiDirectoryPage";
import ApiRecordPage from "./pages/ApiRecordPage";
import AvatarPage from "./pages/AvatarPage";
import ChallengesPage from "./pages/ChallengesPage";
import ContactPage from "./pages/ContactPage";
import FaqPage from "./pages/FaqPage";
import GroupPage from "./pages/GroupPage";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import ProfilePage from "./pages/ProfilePage";
import RegistrationPage from "./pages/RegistrationPage";
import SolutionDetailPage from "./pages/SolutionDetailPage";
import SolutionPage from "./pages/SolutionPage";
import TeamPage from "./pages/TeamPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <SiteLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "sobre", element: <AboutPage /> },
      { path: "faq", element: <FaqPage /> },
      { path: "contato", element: <ContactPage /> },
      { path: "cadastro", element: <RegistrationPage /> },
      { path: "perfil", element: <ProfilePage /> },
      { path: "grupos/novo", element: <GroupPage /> },
      { path: "grupos", element: <ApiDirectoryPage /> },
      { path: "grupos/:id", element: <ApiRecordPage kind="group" /> },
      {
        path: "funcionarios/usuarios/:id",
        element: (
          <EmployeeGate>
            <ApiRecordPage kind="user" />
          </EmployeeGate>
        ),
      },
      { path: "desafios", element: <ChallengesPage /> },
      { path: "integrantes", element: <TeamPage /> },
      { path: "solucao", element: <SolutionPage /> },
      { path: "solucao/:slug", element: <SolutionDetailPage /> },
      { path: "avatar", element: <AvatarPage /> },
      {
        path: "acesso-funcionario",
        element: (
          <EmployeeGate>
            <EmployeeAccessPage />
          </EmployeeGate>
        ),
      },
      {
        path: "gestao",
        element: (
          <EmployeeGate>
            <AdminManagementPage />
          </EmployeeGate>
        ),
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
