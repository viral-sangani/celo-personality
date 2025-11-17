"use client";
import { sdk } from "@farcaster/miniapp-sdk";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import FrameWalletProvider from "./frame-wallet-context";
// Use any types for Farcaster SDK compatibility
type FrameContext = any;
type AddFrameResult = any;

interface MiniAppContextType {
  isMiniAppReady: boolean;
  context: FrameContext | null;
  setMiniAppReady: () => void;
  addMiniApp: () => Promise<AddFrameResult | null>;
}

const MiniAppContext = createContext<MiniAppContextType | undefined>(undefined);

interface MiniAppProviderProps {
  addMiniAppOnLoad?: boolean;
  children: ReactNode;
}

export function MiniAppProvider({
  children,
  addMiniAppOnLoad,
}: MiniAppProviderProps): ReactElement {
  const [context, setContext] = useState<FrameContext | null>(null);
  const [isMiniAppReady, setIsMiniAppReady] = useState(false);

  const setMiniAppReady = useCallback(async () => {
    try {
      const context = await sdk.context;
      if (context) {
        setContext(context);
      }
      await sdk.actions.ready();
    } catch (err) {
      console.error("SDK initialization error:", err);
    } finally {
      setIsMiniAppReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isMiniAppReady) {
      setMiniAppReady().then(() => {
        console.log("MiniApp loaded");
      });
    }
  }, [isMiniAppReady, setMiniAppReady]);

  const handleAddMiniApp = useCallback(async () => {
    try {
      const result = await sdk.actions.addFrame();
      if (result) {
        return result;
      }
      return null;
    } catch (error: any) {
      // Handle InvalidDomainManifest error gracefully
      if (error?.name === "AddMiniApp.InvalidDomainManifest") {
        console.warn(
          "Domain manifest not configured. This is normal in development. " +
            "To fix: Generate your domain manifest at https://farcaster.xyz/~/developers/mini-apps/manifest"
        );
      } else {
        console.error("[error] adding frame", error);
      }
      return null;
    }
  }, []);

  useEffect(() => {
    // on load, set the frame as ready
    // Only try to add frame if not already added and if explicitly requested
    if (isMiniAppReady && !context?.client?.added && addMiniAppOnLoad) {
      // Add a small delay to ensure everything is ready
      const timer = setTimeout(() => {
        handleAddMiniApp();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [
    isMiniAppReady,
    context?.client?.added,
    handleAddMiniApp,
    addMiniAppOnLoad,
  ]);

  return (
    <MiniAppContext.Provider
      value={{
        isMiniAppReady,
        setMiniAppReady,
        addMiniApp: handleAddMiniApp,
        context,
      }}
    >
      <FrameWalletProvider>{children}</FrameWalletProvider>
    </MiniAppContext.Provider>
  );
}

export function useMiniApp(): MiniAppContextType {
  const context = useContext(MiniAppContext);
  if (context === undefined) {
    throw new Error("useMiniApp must be used within a MiniAppProvider");
  }
  return context;
}
