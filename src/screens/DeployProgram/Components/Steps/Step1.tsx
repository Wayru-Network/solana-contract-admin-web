import { Typography } from "antd";
import { Keypair } from "@solana/web3.js";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import { useState, useRef, useEffect } from "react";
import generatingKeypair from "../../../../assets/animations/generating-key.json";
import { theme as appTheme } from "../../../../styles/theme";
import Button from "../../../../components/UI/Button";

const { Text } = Typography;

interface GenerateProgramIdProps {
  programKeypair: Keypair | null;
  setProgramKeypair: (keypair: Keypair | null) => void;
}

export const GenerateProgramId = ({ 
  programKeypair, 
  setProgramKeypair,
}: GenerateProgramIdProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.goToAndStop(84, true);
    }
  }, []);

  const generateProgramKeypair = async () => {
    try {
      setIsGenerating(true);

      if (lottieRef.current) {
        lottieRef.current.playSegments([45, 84], true);
      }

      const newKeypair = Keypair.generate();
      setProgramKeypair(newKeypair);
      
      const keypairString = JSON.stringify(Array.from(newKeypair.secretKey));
      localStorage.setItem("programKeypair", keypairString);
      
      return newKeypair.publicKey.toString();
    } catch (error) {
      setIsGenerating(false);
      console.error(error);
      return null;
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <Button
        onClick={generateProgramKeypair}
        disabled={isGenerating}
      >
        {isGenerating ? "Generating..." : "Generate New Program ID"}
      </Button>
      <div style={{ 
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        paddingTop: "0px",
      }}>
        <div style={{ 
          width: "200px",
        }}>
          <Lottie 
            lottieRef={lottieRef}
            animationData={generatingKeypair}
            loop={false}
            style={{ 
              width: "200px",
              height: "150px",
              filter: "invert(1)",
            }}
            autoplay={false}
            onComplete={() => {
              setIsGenerating(false);
            }}
          />
        </div>

        {programKeypair && !isGenerating && (
          <Text 
            style={{ 
              color: appTheme.palette.text.color,
              marginTop: "-10px",
              fontSize: "15px",
            }}
          >
            Program ID: {programKeypair.publicKey.toString()}
          </Text>
        )}
      </div>
    </div>
  );
};