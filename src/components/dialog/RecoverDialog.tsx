import { Dialog, Transition } from '@headlessui/react';
import { useLocalStorageState } from 'ahooks';
import { BigNumber, ethers } from 'ethers';
import { Fragment, useEffect, useState } from 'react';
import { useProvider } from 'wagmi';
import { AAContractAbi } from '../../abi/AAContractAbi';
import { BluemsunVaultFactoryAbi } from '../../abi/BluemsunVaultFactoryAbi';
import { devaultContract } from '../../constants/contracts';
import { StorageKeys } from '../../constants/keys';
import { useVault } from '../../hooks/useVault';
import { aesDecrypt, getAesIV, getAesKey } from '../../utils/AES';
import IPFSClient from '../../utils/IPFS';
import { hash } from '../../utils/hash';
import { getUserId } from '../../utils/user';

export default function RecoverDialog({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}) {
  const [email, setEmail] = useState('');
  const [masterPassword, setMasterPassword] = useState('');
  const [secretKey, setSecretKey] = useState('');

  const [loading, setIsLoading] = useState(false);
  const [isRecoverSuccess, setIsRecoverSuccess] = useState(false);

  const provider = useProvider();
  const { init: initVault, passwordList } = useVault();

  const [initialized, setInitialized] = useLocalStorageState(StorageKeys.vaultSetupFinished, {
    defaultValue: false,
  });

  useEffect(() => {
    setEmail('');
    setMasterPassword('');
    setSecretKey('');
    setIsLoading(false);
    setIsRecoverSuccess(false);
  }, [isOpen]);

  async function onsubmit() {
    if (!email || !masterPassword || !secretKey) return;
    setIsLoading(true);
    const vaultKey = hash('1');
    const factoryContract = new ethers.Contract(devaultContract, BluemsunVaultFactoryAbi, provider);
    const userId = BigNumber.from(getUserId(email, secretKey)).toString();
    try {
      let devaultAddress = await factoryContract.getBluemsunVault(userId);

      if (devaultAddress) {
        const aaContract = new ethers.Contract(devaultAddress, AAContractAbi, provider);
        window.localStorage.setItem(StorageKeys.contractAddrKey, devaultAddress);
        let vaultVaule = await aaContract.getVault(vaultKey);
        if (vaultVaule) {
          let file: any = await IPFSClient.getFile(vaultVaule);
          if (file) {
            setIsRecoverSuccess(true);
            setInitialized(true);

            let text = await file.text();
            const aesKey = getAesKey(email, masterPassword, secretKey);
            const aesIV = getAesIV(masterPassword, secretKey);
            let plainText = aesDecrypt(text, aesKey, aesIV);
            initVault(plainText);
            window.localStorage.setItem(StorageKeys.getSecretKey(masterPassword), secretKey);
            window.localStorage.setItem(StorageKeys.emailKey, email);
            window.localStorage.setItem(StorageKeys.getVaultKey(masterPassword, secretKey), text);
            setIsRecoverSuccess(true);
            setInitialized(true);
          } else {
            throw new Error('file not exist');
          }
        } else {
          throw new Error('valut not exist');
        }
      } else {
        throw new Error('not exist');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={() => setIsOpen(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-[80%] transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                  登录账号
                </Dialog.Title>
                {isRecoverSuccess ? (
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-3xl mt-5">
                      恭喜! 你的账户已经成功登录！
                    </div>
                    <button
                      type="button"
                      className="btn w-full mt-16 bg-blue-300 hover:bg-blue-400 border-none text-gray-100"
                      onClick={() => {
                        setIsOpen(false);
                      }}
                    >
                      好的
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mt-2">
                      <div className="form-control w-full">
                        <label className="label">
                          <span className="label-text">你的邮箱</span>
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="邮箱"
                          className="input w-full input-sm focus:outline-none focus:ring-2"
                        />
                        <label className="label mt-2">
                          <span className="label-text">主密码</span>
                        </label>
                        <input
                          type="password"
                          placeholder="主密码"
                          value={masterPassword}
                          onChange={(e) => setMasterPassword(e.target.value)}
                          className="input w-full input-sm focus:outline-none focus:ring-2"
                        />
                        <label className="label mt-2">
                          <span className="label-text">密钥</span>
                        </label>

                        <input
                          type="password"
                          placeholder="密钥"
                          value={secretKey}
                          onChange={(e) => setSecretKey(e.target.value)}
                          className="input w-full input-sm focus:outline-none focus:ring-2"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      {loading ? (
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 btn-disabled"
                        >
                          正在加载
                        </button>
                      ) : (
                        <button type="button" className="btn w-full bg-blue-300 hover:bg-blue-400 border-none text-gray-100" onClick={() => onsubmit()}>
                          提交
                        </button>
                        // <button
                        //   type="button"
                        //   className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        //   onClick={() => onsubmit()}
                        // >
                        //   提交
                        // </button>
                      )}
                    </div>
                  </>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
