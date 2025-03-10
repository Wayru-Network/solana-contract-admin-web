import { useState } from 'react';
import { Input, Card, Typography, message } from 'antd';
import { WalletOutlined } from '@ant-design/icons';
import { theme as appTheme } from '../../styles/theme';
import Button from "../../components/UI/Button";

const { Title, Text } = Typography;

const UpdateAdmin = () => {
  const [newAdminAddress, setNewAdminAddress] = useState('');
  const [isRequestSent, setIsRequestSent] = useState(false);

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
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px' }}>
      {!isRequestSent ? (
        <Card title={<Title 
          style={{
            color: appTheme.palette.text.color,
            marginBottom: 32,
            textAlign: "center",
          }}
          level={2}>Request Update Admin</Title>}>
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
          <Button block onClick={handleRequestUpdate}>
            Send Request
          </Button>
        </Card>
      ) : (
        <Card title={<Title level={3}>Accept Request Update</Title>}>
          <div style={{ marginBottom: 24 }}>
            <Text>New admin address:</Text>
            <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 4, marginTop: 8 }}>
              {newAdminAddress}
            </div>
          </div>
          <Button block onClick={handleAcceptRequest}>
            Sign with Wallet
          </Button>
        </Card>
      )}
    </div>
  );
};

export default UpdateAdmin;
