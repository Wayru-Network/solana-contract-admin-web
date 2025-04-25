import { FormCard } from "../../../components/FormCard/FormCard";
import { FormScreenWrapper } from "../../../components/Wrappers/FormScreenWrapper";
import { FormValues, UpdateTokenMetadataForm } from "./Components/UpdateTokenForm";
import { Form } from "antd";
import { usePhantom } from "../../../hooks/usePhantom";
import { Provider } from "../../../interfaces/phantom/phantom";

const UpdateTokenMetadata = () => {
  const [form] = Form.useForm();
  const { provider } = usePhantom();

  const onSubmit = (values: FormValues) => {
    console.log(values);
  };

  return (
    <FormScreenWrapper>
      <FormCard
        minWidth={500}
        title="Update Token Metadata"
        formBody={
          <UpdateTokenMetadataForm
            form={form}
            provider={provider as Provider}
            onSubmit={onSubmit}
            mintKeyStatus={null}
          />
        }
      />
    </FormScreenWrapper>
  );
};

export default UpdateTokenMetadata;
