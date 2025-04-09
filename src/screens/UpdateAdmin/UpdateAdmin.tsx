import { useState } from "react";
import { Input, Card, Typography, message } from "antd";
import { WalletOutlined } from "@ant-design/icons";
import Button from "../../components/UI/Button";
import { FormCard } from "../../components/FormCard/FormCard";
import { usePhantom } from "../../hooks/usePhantom";
import { theme as appTheme } from "../../styles/theme";
import { FormScreenWrapper } from "../../components/Wrappers/FormScreenWrapper";

const { Title, Text } = Typography;

const UpdateAdmin = () => {
  const [newAdminAddress, setNewAdminAddress] = useState("");
  const [isRequestSent, setIsRequestSent] = useState(false);
  const { provider } = usePhantom();

  const handleRequestUpdate = () => {
    if (!newAdminAddress) {
      message.error("Please enter a valid wallet address");
      return;
    }
    setIsRequestSent(true);
  };

  const handleAcceptRequest = async () => {
    try {
      // here we need to sign the request with the wallet
      message.success("Request signed successfully");
    } catch (e) {
      console.log("Error signing request", e);
    }
  };

  return (
    <FormScreenWrapper>
      <FormCard
        title="Request Update Admin"
        formBody={
          <div>
            {!isRequestSent ? (
              <div>
                <div style={{ marginBottom: 24 }}>
                  <Text>Enter the new admin address:</Text>
                  <Input
                    prefix={<WalletOutlined />}
                    placeholder="0x..."
                    value={newAdminAddress}
                    onChange={(e) => setNewAdminAddress(e.target.value)}
                    style={{ marginTop: 8 }}
                  />
                </div>
                <Button
                  disabled={!provider?.publicKey}
                  block
                  onClick={handleRequestUpdate}
                >
                  Send Request
                </Button>
              </div>
            ) : (
              <Card title={<Title level={3}>Accept Request Update</Title>}>
                <div style={{ marginBottom: 24 }}>
                  <Text>New admin address:</Text>
                  <div
                    style={{
                      background: "#f5f5f5",
                      padding: 12,
                      borderRadius: 4,
                      marginTop: 8,
                    }}
                  >
                    {newAdminAddress}
                  </div>
                </div>
                <Button block onClick={handleAcceptRequest}>
                  Sign with Wallet
                </Button>
              </Card>
            )}
          </div>
        }
        bottomComponent={
          !provider?.publicKey && (
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Typography.Text
                style={{
                  color: appTheme.palette.error.main,
                  textAlign: "center",
                  marginTop: "16px",
                }}
              >
                Please connect your wallet
              </Typography.Text>
            </div>
          )
        }
      />
    </FormScreenWrapper>
  );
};

export default UpdateAdmin;
