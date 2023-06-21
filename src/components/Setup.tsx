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
      <img src={logo} className="App-logo mt-10" alt="logo" />

      <p className="mb15 text-xl font-medium text-white mb-10">欢迎来到Bluemsun密码保险箱</p>
      <div className="flex gap-2 mt-2 ">
        <button className="btn btn-md text-blue-950 bg-gray-100 border-none hover:text-gray-100" onClick={() => setIsSetupOpen(true)}>
          创建新钱包账户
        </button>
        <button className="btn text-blue-950 bg-gray-100 border-none hover:text-gray-100" onClick={() => setIsRecoverOpen(true)}>
          登录原有账号
        </button>
      </div>
    </div>
  );
}
