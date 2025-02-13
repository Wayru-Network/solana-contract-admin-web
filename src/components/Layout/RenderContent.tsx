import Settings from "../../screens/Settings/Settings";
import { useNavigation } from "../../hooks/useNavigationContext";
import Deposit from "../../screens/Deposit/Deposit";

export const RenderContent = () => {
  const { currentScreen } = useNavigation();
  console.log(currentScreen);

  switch (currentScreen) {
    case 'deposit':
      return <Deposit />;
    case 'settings':
      return <Settings />;
    default:
      return <Settings />;
  }
};