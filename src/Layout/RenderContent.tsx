import Settings from "../screens/Settings/Settings";
import { useNavigation } from "../hooks/useNavigationContext";
import FundContract from "../screens/FundContract/FundContract";
import AuthorityConfigurations from "../screens/AuthorityConfigs/AuthorityConfigs";

export const RenderContent = () => {
  const { currentScreen } = useNavigation();

  switch (currentScreen) {
    case 'fund-contract':
      return <FundContract />;
    case 'settings':
      return <Settings />;
    case 'authority-configs':
      return <AuthorityConfigurations />;
    default:
      return <Settings />;
  }
};