import { PhantomProvider } from "./context/PhantomContext";
import { NavigationProvider } from "./context/NavigationContext";
import LayoutComponent from "./components/Layout/Layout";
import "antd/dist/reset.css";
import { ConfigProvider } from 'antd';

function AppContent() {
  return (
    <LayoutComponent />
  );
}

function App() {
  return (
    <ConfigProvider>
      <PhantomProvider>
        <NavigationProvider>
          <AppContent />
        </NavigationProvider>
      </PhantomProvider>
    </ConfigProvider>
  );
}

export default App;
