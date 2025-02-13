import { PhantomProvider } from "./context/PhantomContext";
import { NavigationProvider } from "./context/NavigationContext";
import LayoutComponent from "./components/Layout/Layout";
import { ConfigProvider } from "antd";
import { theme as appTheme } from "./styles/theme";
import "antd/dist/reset.css";
import "./styles/global.css";

function AppContent() {
  return <LayoutComponent />;
}

function App() {
  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            itemActiveBg: appTheme.palette.common.white,
            itemBg: appTheme.palette.wayru.secondary,
            itemColor: appTheme.palette.common.black,
            itemSelectedBg: appTheme.palette.common.white,
            itemSelectedColor: appTheme.palette.wayru.secondaryContainer,
            colorBgContainer: appTheme.palette.wayru.inverseSurface,
            fontSize: 14,
          },
          Button: {
            colorPrimary: appTheme.palette.wayru.secondaryContainer,
            colorPrimaryHover: appTheme.palette.wayru.secondaryContainer,
            colorPrimaryActive: appTheme.palette.wayru.secondaryContainer,
            primaryColor: appTheme.palette.wayru.onSecondaryContainer,
            fontSize: 14,
          },
        },
      }}
    >
      <PhantomProvider>
        <NavigationProvider>
          <AppContent />
        </NavigationProvider>
      </PhantomProvider>
    </ConfigProvider>
  );
}

export default App;
