import { createBrowserRouter } from "react-router-dom";
import LayoutComponent from "./Layout/Layout";
import Settings from "./screens/Settings/Settings";
import FundContract from "./screens/FundContract/FundContract";
import AuthorityConfigurations from "./screens/AuthorityConfigs/AuthorityConfigs";
import InitializeContract from "./screens/InitializeContract/InitializeContract";
import UpdateAdmin from "./screens/UpdateAdmin/UpdateAdmin";
import MintTokens from "./screens/MintTokens/MintTokens";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LayoutComponent />,
    children: [
      {
        path: "/",
        element: <Settings />,
      },
      {
        path: "fund-contract",
        element: <FundContract />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "authority-configs",
        element: <AuthorityConfigurations />,
      },
      {
        path: "update-admin",
        element: <UpdateAdmin />,
      },
      {
        path: "initialize-contract",
        element: <InitializeContract />,
      },
      {
        path: "mint-tokens",
        element: <MintTokens />,
      },
    ],
  },
]);