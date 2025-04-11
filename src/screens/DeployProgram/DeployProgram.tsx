import { useState } from "react";
import { FormScreenWrapper } from "../../components/Wrappers/FormScreenWrapper";
import { Upload, Form, message, Steps, Select } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { FormCard } from "../../components/FormCard/FormCard";
import { theme as appTheme } from "../../styles/theme";
import { Idl } from "@project-serum/anchor";
import { Keypair } from "@solana/web3.js";
import Button from "../../components/UI/Button";
import { GenerateProgramId } from "./Components/Steps/Step1";
import { StepsProps } from 'antd';
const { Dragger } = Upload;

interface DeployProgramFormValues {
  network: "devnet" | "mainnet";
}

const DeployProgram = () => {
  const [form] = Form.useForm<DeployProgramFormValues>();
  const [idl, setIdl] = useState<Idl | null>(null);
  const [programKeypair, setProgramKeypair] = useState<Keypair | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const handleIdlUpload = async (file: File) => {
    try {
      const text = await file.text();
      const parsedIdl = JSON.parse(text);
      setIdl(parsedIdl);
      message.success(`${file.name} file uploaded successfully`);
      localStorage.setItem("programIdl", text);
      return false;
    } catch (error) {
      message.error("Failed to parse IDL file");
      console.error(error);
      return false;
    }
  };

  const handleDeploy = async (values: DeployProgramFormValues) => {
    try {
      console.log(values);
      if (!programKeypair || !idl) {
        message.error("Please generate program keypair and upload IDL first");
        return;
      }

      // Here we'll implement the actual deployment steps
      // 1. Build program (if needed)
      // 2. Deploy program
      // 3. Initialize IDL

      message.success("Program deployed successfully!");
    } catch (error) {
      console.error("Error deploying program:", error);
      message.error("Failed to deploy program");
    }
  };

  const steps = [
    {
      title: "Generate Program ID",
      content: (
        <GenerateProgramId
          programKeypair={programKeypair}
          setProgramKeypair={setProgramKeypair}
        />
      ),
    },
    {
      title: "Upload IDL",
      content: (
        <Form.Item
          name="idlFile"
          rules={[{ required: true, message: "Please upload the IDL file" }]}
        >
          <Dragger
            accept=".json"
            beforeUpload={handleIdlUpload}
            maxCount={1}
            style={{
              background: appTheme.palette.wayru.surfaceContainerLow,
              borderColor: appTheme.palette.wayru.outlineVariant,
            }}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined
                style={{ color: appTheme.palette.wayru.primary }}
              />
            </p>
            <p
              className="ant-upload-text"
              style={{ color: appTheme.palette.text.color }}
            >
              Click or drag IDL file to upload
            </p>
          </Dragger>
        </Form.Item>
      ),
    },
    {
      title: "Deploy",
      content: (
        <Form.Item
          name="network"
          label="Select Network"
          rules={[{ required: true, message: "Please select a network" }]}
        >
          <Select
            options={[
              { label: "Devnet", value: "devnet" },
              { label: "Mainnet", value: "mainnet" },
            ]}
            style={{
              width: "100%",
              background: appTheme.palette.wayru.surfaceContainerLow,
            }}
          />
        </Form.Item>
      ),
    },
  ];

  return (
    <FormScreenWrapper>
      <FormCard
        title="Deploy Solana Program"
        formBody={
          <Form form={form} layout="vertical" onFinish={handleDeploy}>
            <Steps
              current={currentStep}
              items={steps.map((item) => ({ title: item.title }))}
              style={{ marginBottom: "24px" }}
              className="custom-steps"
              {...{} as StepsProps}
            />

            <div>{steps[currentStep].content}</div>

            <div style={{ marginTop: "24px", textAlign: "right" }}>
              {currentStep > 0 && (
                <Button
                  style={{ marginRight: "8px" }}
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  Previous
                </Button>
              )}
              {currentStep < steps.length - 1 && (
                <Button onClick={() => setCurrentStep(currentStep + 1)}>
                  Next
                </Button>
              )}
              {currentStep === steps.length - 1 && (
                <Button
                  type="primary"
                  onClick={() => form.submit()}
                  disabled={!programKeypair || !idl}
                >
                  Deploy Program
                </Button>
              )}
            </div>
          </Form>
        }
      />
    </FormScreenWrapper>
  );
};

export default DeployProgram;
