import { FormCard } from "../../../components/FormCard/FormCard";
import { FormScreenWrapper } from "../../../components/Wrappers/FormScreenWrapper";
import {
  FormValues,
  UpdateTokenMetadataForm,
} from "./Components/UpdateTokenForm";
import { Form } from "antd";
import { usePhantom } from "../../../hooks/usePhantom";
import { Provider } from "../../../interfaces/phantom/phantom";
import { useGlobalProgress } from "../../../hooks/useGlobalProgress";
import { updateTokenURI } from "../../../services/solana/update-token";
import { useSettings } from "../../../hooks/useSettings";
import { CONSTANTS } from "../../../constants";
import { PublicKey } from "@solana/web3.js";

const UpdateTokenMetadata = () => {
  const [form] = Form.useForm();
  const { provider } = usePhantom();
  const { setProgressState } = useGlobalProgress();
  const { settings, refreshSettingsState } = useSettings();
  const network =
    settings?.network as keyof CONSTANTS["NETWORK"]["EXPLORER_ACCOUNT_URL"];

  const onSubmit = async (values: FormValues) => {
    if (!provider) return;
    setProgressState({ percent: 50 });

    try {
      const { mint, newUri } = values;
      console.log('mint', mint);
      const { txStatus } = await updateTokenURI({
        network,
        provider,
        mint: new PublicKey(mint),
        newUri,
      });

      setProgressState({ percent: 75 });
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (txStatus.status === "confirmed") {
        setProgressState({ percent: 100, status: "success" });
        refreshSettingsState();
        form.resetFields();
      } else {
        setProgressState({ percent: 100, status: "exception" });
      }
    } catch (error) {
      console.error(error);
      setProgressState({ percent: 100, status: "exception" });
    }
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
          />
        }
      />
    </FormScreenWrapper>
  );
};

export default UpdateTokenMetadata;
