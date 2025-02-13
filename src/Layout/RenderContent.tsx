import Settings from "../screens/Settings/Settings";
import { useNavigation } from "../hooks/useNavigationContext";
import FundContract from "../screens/FundContract/FundContract";
import AddAuthority from "../screens/AddAuthority/AddAuthority";

export const RenderContent = () => {
  const { currentScreen } = useNavigation();

  switch (currentScreen) {
    case 'fund-contract':
      return <FundContract />;
    case 'settings':
      return <Settings />;
    case 'add-authority':
      return <AddAuthority />;
    default:
      return <Settings />;
  }
};