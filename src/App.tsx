import { useLocalStorageState } from 'ahooks';
import { useState } from 'react';
import { useAccount, useConnect } from 'wagmi';
import './App.css';
import Header from './components/Header';
import Lock from './components/Lock';
import Setup from './components/Setup';
import VaultList from './components/VaultList';
import { StorageKeys } from './constants/keys';

function App() {
  const { connectAsync, connectors } = useConnect();
  const { isConnected } = useAccount();
  const [locked, setLocked] = useState(true);
  const [initialized] = useLocalStorageState(StorageKeys.vaultSetupFinished, {
    defaultValue: false,
  });

  return (
    <div className="App relative flex flex-col">
      <Header isConnected={isConnected} setLocked={setLocked} />
      <header className="App-header">
        {isConnected && !initialized && <Setup />}
        {isConnected && locked && initialized && <Lock setUnlock={() => setLocked(false)} />}
        {!isConnected && (
          <button
            className="btn mt-40 text-gray-950 bg-gray-100 border-none text-xl hover:text-gray-100"
            onClick={() => {
              connectAsync({
                connector: connectors.find((e) => e.id === 'metaMask'),
              });
            }}
          >
            连接到Bluemsun钱包
          </button>
        )}
      </header>
      {isConnected && !locked && initialized && <VaultList />}
    </div>
  );
}

export default App;
