import { useContext } from "react";
import {PhantomContext} from "../context/PhantomContext";

export const usePhantom = () => {
    const context = useContext(PhantomContext);
    if (context === undefined) {
      throw new Error('usePhantom must be used within a PhantomProvider');
    }
    return context;
  } 