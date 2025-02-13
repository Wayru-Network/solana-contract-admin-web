
export const getProvider = () => {
    if ('phantom' in window) {
        const phantom = window.phantom as any;
      const provider = phantom?.solana;
  
      if (provider?.isPhantom) {
        return provider;
      }
    }
  
    window.open('https://phantom.app/', '_blank');
  };

