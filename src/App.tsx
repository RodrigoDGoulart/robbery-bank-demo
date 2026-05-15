import { useEffect, useState } from "react";
import "./App.scss";
import GridBoard from "./components/GridBoard";
import { preloadSlotItemAnimations } from "./components/VerticalSlotReel/SlotItem/preloadSlotItemAnimations";
import { slotItemConfigs } from "./components/VerticalSlotReel/SlotItem/SlotItem.constants";
import LoadingFrame from "./components/LoadingFrame";

function App() {
  const [loadedItems, setLoadedItems] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    preloadSlotItemAnimations({
      onItemLoaded: (nextLoadedItems) => {
        if (!isCancelled) {
          setLoadedItems(nextLoadedItems);
        }
      },
    }).then(() => {
      if (!isCancelled) {
        setIsReady(true);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, []);

  if (!isReady) {
    return (
      <LoadingFrame 
        loading={loadedItems / slotItemConfigs.length}
      />
    );
  }

  return (
    <div className="app-shell">
      <GridBoard />
    </div>
  );
}

export default App;
