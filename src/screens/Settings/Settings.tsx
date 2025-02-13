import { Card, Input, Form, Typography,  } from 'antd';
import Button from '../../components/UI/Button';

const { Title } = Typography;

const Settings = () => {
  const handleSubmit = (values: { contractId: string }) => {
    localStorage.setItem('programId', values.contractId);
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px' }}>
      <Card>
        <Title level={2}>
          Settings
        </Title>
        
        <Form
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="contractId"
            label="Contract ID"
            tooltip="Enter contract ID for deposits"
            rules={[{ required: true, message: 'Please enter the contract ID' }]}
          >
            <Input
              placeholder="Enter contract ID"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="token"
            label="Token ID"
            tooltip="Enter token ID for deposits"
            rules={[{ required: true, message: 'Please enter the token ID' }]}
          >
            <Input
              placeholder="Enter token ID"
              style={{ width: '100%' }}
            />
          </Form.Item>
          
          <Form.Item>
            <Button htmlType="submit" block>
              Save Settings
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Settings;
