import { PhantomProvider } from "./context/PhantomContext";
import { ConfigProvider } from "antd";
import { theme as appTheme } from "./styles/theme";
import "antd/dist/reset.css";
import "./styles/global.css";
import { SettingsProvider } from "./context/SettingsContext";
import { GlobalProgressProvider } from './context/GlobalProgressContext';
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { App as AntApp } from 'antd';

function App() {
  return (
    <GlobalProgressProvider>
      <AntApp>
        <ConfigProvider
          theme={{
            components: {
              Menu: {
                itemActiveBg: 'transparent',
                itemBg: 'transparent',
                itemColor: appTheme.palette.wayru.inverseSurface,
                itemSelectedBg: appTheme.palette.wayru.scrim,
                itemSelectedColor: appTheme.palette.wayru.secondary,
                colorBgContainer: appTheme.palette.wayru.scrim,
                fontSize: 14,
              },
              Button: {
                colorPrimary: appTheme.palette.wayru.secondaryContainer,
                colorPrimaryHover: appTheme.palette.wayru.secondaryContainer,
                colorPrimaryActive: appTheme.palette.wayru.secondaryContainer,
                primaryColor: appTheme.palette.wayru.onSecondaryContainer,
                fontSize: 14,
              },
              Card: {
                colorBgContainer: appTheme.palette.wayru.surfaceContainerLow,
                colorBorderSecondary: appTheme.palette.wayru.outlineVariant,
                borderRadius: 10,
                borderRadiusLG: 10,
                lineWidth: 0.5,
                lineWidthBold: 0,
              },
              Form: {
                colorTextBase: appTheme.palette.text.color,
                colorText: appTheme.palette.text.color,
                labelColor: appTheme.palette.text.color,
                colorIcon: appTheme.palette.text.color,
              },
              Typography: {
                colorText: appTheme.palette.text.color,
                fontSize: 13,
              },
              Select: {
                colorText: appTheme.palette.wayru.onSecondaryContainer,
                colorTextPlaceholder: appTheme.palette.wayru.onSecondaryContainer,
                colorBgBase: appTheme.palette.wayru.secondaryContainer,
                colorBgContainer: appTheme.palette.wayru.secondaryContainer,
                colorBorder: appTheme.palette.wayru.outlineVariant,
                colorIcon: appTheme.palette.wayru.onSecondaryContainer,
                colorTextDisabled: appTheme.palette.wayru.onSecondaryContainer,
                colorBgElevated: appTheme.palette.wayru.secondaryContainer,
                colorBgContainerDisabled: appTheme.palette.wayru.scrim,
              },
              Input: {
                colorText: appTheme.palette.text.color,
                colorTextPlaceholder: appTheme.palette.text.color,
                colorBgBase: appTheme.palette.wayru.surfaceContainerLow,
                colorBgContainer: appTheme.palette.wayru.surfaceContainerLow,
                colorBorder: appTheme.palette.wayru.outlineVariant,
              }
            },
          }}
        >
          <PhantomProvider>
            <SettingsProvider>
              <RouterProvider router={router} />
            </SettingsProvider>
          </PhantomProvider>
        </ConfigProvider>
      </AntApp>
    </GlobalProgressProvider>
  );
}

export default App;
