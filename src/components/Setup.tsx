import { useState } from 'react';
import logo from '../logos.png';
import RecoverDialog from './dialog/RecoverDialog';
import SetupDialog from './dialog/SetupDialog';

export default function Setup() {
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isRecoverOpen, setIsRecoverOpen] = useState(false);

  return (
    <div className="w-full h-full flex flex-col items-center relative">
      <SetupDialog isOpen={isSetupOpen} setIsOpen={setIsSetupOpen} />
      <RecoverDialog isOpen={isRecoverOpen} setIsOpen={setIsRecoverOpen} />
      <img src={logo} className="App-logo" alt="logo" />

      <p className="mb15 text-xl font-medium text-white">欢迎来到密码保险箱</p>
      <div className="flex gap-2 mt-2">
        <button className="btn btn-md" onClick={() => setIsSetupOpen(true)}>
          创建新钱包账户
        </button>
        <button className="btn" onClick={() => setIsRecoverOpen(true)}>
          登录原有账号
        </button>
      </div>
    </div>
  );
}
