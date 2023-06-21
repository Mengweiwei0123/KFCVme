import { useEffect, useState } from 'react';
import { useDisconnect } from 'wagmi';
import { StorageKeys } from '../constants/keys';
import logo from './../logos.png'

export default function Header({
  isConnected,
  setLocked,
}: {
  isConnected: boolean;
  setLocked: (e: boolean) => void;
}) {
  const [aaAddr, setAaAddr] = useState('');
  const [email, setEmail] = useState('');
  const { disconnectAsync } = useDisconnect();

  useEffect(() => {
    setAaAddr(window.localStorage.getItem(StorageKeys.contractAddrKey) ?? '');
    setEmail(window.localStorage.getItem(StorageKeys.emailKey) ?? '');
  }, []);

  return (
    <header className="h-20">
      {isConnected && (
        <div className="flex w-full py-2 px-4 items-center mt-5">
          <div className="flex items-center grow">
            <img alt="" src={logo} width={64} height={64} />
            <div className="text-white text-left">
              <p className="text-bold">{email}</p>
              <p className="text-xs text-slate-200">
                {aaAddr?.substring(0, 5) + '..' + aaAddr?.substring(38)}
              </p>
            </div>
          </div>

          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="w-10 h-10 text-slate-200 btn p-0 btn-circle btn-sm bg-gray-100 border-none">
              <img alt="" src="img/icon.svg" width={16} height={16} className="text-white" />
            </label>

            <ul
              tabIndex={0}
              className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <div onClick={() => disconnectAsync()}>断开连接</div>
              </li>
              <li>
                <div onClick={() => setLocked(true)}>锁定账户</div>
              </li>
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
