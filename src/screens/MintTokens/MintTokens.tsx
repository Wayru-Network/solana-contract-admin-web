import { Input, Form, Row, Col } from "antd";
import { FormCard } from "../../components/FormCard/FormCard";
import { FormScreenWrapper } from "../../components/Wrappers/FormScreenWrapper";
import Button from "../../components/UI/Button";

const MintTokens = () => {
  const [form] = Form.useForm();

  const handleSubmit = () => {
    console.log("send");
  };

  return (
    <FormScreenWrapper>
      <FormCard
        minWidth={500}
        title="Mint Tokens"
        formBody={
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Row gutter={[16, 0]}>
              <Col span={12}>
                <Form.Item
                  label="Total to supply"
                  name="totalSupply"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the total supply",
                    },
                  ]}
                >
                  <Input placeholder="0.00" type="number" />
                </Form.Item>

                <Form.Item
                  label="Name"
                  name="name"
                  rules={[{ required: true, message: "Please enter the name" }]}
                >
                  <Input placeholder="Token Name" />
                </Form.Item>

                <Form.Item
                  label="Symbol"
                  name="symbol"
                  rules={[
                    { required: true, message: "Please enter the symbol" },
                  ]}
                >
                  <Input placeholder="Token Symbol" />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Decimals"
                  name="decimals"
                  rules={[
                    { required: true, message: "Please enter the decimals" },
                  ]}
                >
                  <Input placeholder="Token Decimals" />
                </Form.Item>

                <Form.Item
                  label="Token image url"
                  name="imageUrl"
                  rules={[
                    { required: true, message: "Please enter the image url" },
                  ]}
                >
                  <Input placeholder="Token Image url" />
                </Form.Item>

                <Form.Item
                  label="Token description"
                  name="description"
                  rules={[
                    {
                      required: false,
                      message: "Please enter the description",
                    },
                  ]}
                >
                  <Input placeholder="Token Description" />
                </Form.Item>
              </Col>
            </Row>
            <Button htmlType="submit" block>
              Mint
            </Button>
          </Form>
        }
      />
    </FormScreenWrapper>
  );
};

export default MintTokens;
