import React, { useState } from "react";
import { Layout } from "antd";
import { Sidebar } from "../Sidebar/Sidebar";
import { RenderContent } from "./RenderContent";
import { HeaderComponent } from "../Header/Header";
const { Content } = Layout;

const LayoutComponent: React.FC = () => {
  const [collapsed] = useState(false);

  return (
    <Layout
      style={{
        height: "100vh",
        width: "100%",
      }}
    >
      <Sidebar collapsed={collapsed} />
      <Layout
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          flex: 1,
          background: "transparent",
        }}
      >
       <HeaderComponent/>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            flex: 1,
            overflow: "auto",
          }}
        >
          <RenderContent />
        </Content>
      </Layout>
    </Layout>
  );
};

export default LayoutComponent;
