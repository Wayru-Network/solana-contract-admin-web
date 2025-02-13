import { Card, Input, Button, Form, Typography } from 'antd';
import { SettingOutlined } from '@ant-design/icons';

const { Title } = Typography;

const Settings = () => {
  const handleSubmit = (values: { contractId: string }) => {
    localStorage.setItem('programId', values.contractId);
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px' }}>
      <Card>
        <Title level={2}>
          <SettingOutlined /> Configuración
        </Title>
        
        <Form
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="contractId"
            label="ID del Contrato"
            tooltip="Agregar ID del contrato para depósitos"
            rules={[{ required: true, message: 'Por favor ingresa el ID del contrato' }]}
          >
            <Input
              placeholder="Ingresa el ID del contrato"
              style={{ width: '100%' }}
            />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Guardar Configuración
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Settings;
