import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import {
  generateSecretKey,
  getDataHash,
  getProof,
  getPwdHash,
  getUserId,
  stringToHex,
} from '../../utils/user';
import { aesEncrypt, getAesIV, getAesKey } from '../../utils/AES';
import { StorageKeys } from '../../constants/keys';
import { useLocalStorageState } from 'ahooks';
import { useProvider, useSigner } from 'wagmi';
import { BluemsunVaultFactoryAbi } from '../../abi/BluemsunVaultFactoryAbi';
import { useVault } from '../../hooks/useVault';
import { AAContractAbi } from '../../abi/AAContractAbi';
import { hash } from '../../utils/hash';
import { BigNumber, ethers } from 'ethers';
import IPFSClient from '../../utils/IPFS';
import { masterPasswordState } from '../../store/store';
import { useSetRecoilState } from 'recoil';
// import IPFSClient from '../../utils/IPFS';

export default function SetupDialog({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}) {
  const [email, setEmail] = useState('');
  const [masterPassword, setMasterPassword] = useState('');
  const [reenter, setReenter] = useState('');

  const provider = useProvider();
  const signer = useSigner();
  const [showSecretKey, setShowSecretKey] = useState('');
  const setRecoilMaster = useSetRecoilState(masterPasswordState);

  const { init: initVault, passwordList } = useVault();

  const [loading, setIsLoading] = useState(false);
  const [isCreateSuccess, setIsCreateSuccess] = useState(false);

  const [initialized, setInitialized] = useLocalStorageState(StorageKeys.vaultSetupFinished, {
    defaultValue: false,
  });

  useEffect(() => {
    setEmail('');
    setMasterPassword('');
    setReenter('');
    setIsLoading(false);
    setIsCreateSuccess(false);
  }, [isOpen]);

  async function onSubmit() {
    if (!email || !masterPassword || !reenter) return;
    if (masterPassword !== reenter) return;
    setIsLoading(true);

    const factoryContract = new ethers.Contract(
      // '0x8ede80F98290383A39695809B5413A8D28783B40',
      "0x24440fBFa8a6189c0Ac3c2AdB8DAe46b34BBD224",
      BluemsunVaultFactoryAbi,
      provider
    );

    const secretKey = generateSecretKey();
    const vaultKey = hash('1');
    const userId = BigNumber.from(getUserId(email, secretKey)).toString();

    window.localStorage.setItem(StorageKeys.getSecretKey(masterPassword), secretKey);
    window.localStorage.setItem(StorageKeys.emailKey, email);

    const aesKey = getAesKey(email, masterPassword, secretKey);
    const aesIV = getAesIV(masterPassword, secretKey);
    const vaultText = `email|${email}|${email}`;
    const encryptedVault = aesEncrypt(vaultText, aesKey, aesIV);

    setShowSecretKey(secretKey);
    try {
      const fileCid = await IPFSClient.uploadFile(encryptedVault);

      let passwordHash = await getProof(
        provider,
        masterPassword,
        userId,
        '0',
        getDataHash(vaultKey, fileCid)
      );
      const pwdHass = passwordHash.pwdhash;

      window.localStorage.setItem(
        StorageKeys.getVaultKey(masterPassword, secretKey),
        encryptedVault
      );

      let factoryContractSigner = factoryContract.connect(signer.data as ethers.Signer);
      console.log("aaaaa"+signer.data)
      // console.log("=============factorContractSigner==============" + factoryContractSigner)
      let factoryContractTransaction = await factoryContractSigner.createBluemsunVault(userId, pwdHass);
      // console.log("============factoryconstractTransaction=============" + factoryContractTransaction)
      let res = await factoryContractTransaction.wait();
      // console.log(res)
      // console.log("===========res.log==========" + res.logs[0])
      let contract = BigNumber.from(res.logs[0].topics[2]).toHexString();
      console.log("=============constract========================" + contract)
      window.localStorage.setItem(StorageKeys.contractAddrKey, contract);
      const aaContract = new ethers.Contract(contract, AAContractAbi, provider);
      let nonce: BigNumber = await aaContract.getNonce();
      let proof = await getProof(
        provider,
        masterPassword,
        userId,
        nonce.toString(),
        getDataHash(vaultKey, fileCid)
      );

      let txSigner = aaContract.connect(signer.data as ethers.Signer);
      let transaction = await txSigner.setVault(
        vaultKey,
        fileCid,
        proof.proof,
        proof.expiration,
        proof.allhash
      );
      await transaction.wait();
      setRecoilMaster(masterPassword);
      setIsCreateSuccess(true);
      setInitialized(true);
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
                  创建新钱包账户
                </Dialog.Title>

                {isCreateSuccess ? (
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-3xl mt-5">
                    恭喜! 你的账户已经成功创建！
                    </div>
                    <div className="text-xl mt-10">你的密钥为 {showSecretKey}</div>
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
                          <span className="label-text">再次输入密码</span>
                        </label>
                        <input
                          type="password"
                          placeholder="密码"
                          value={reenter}
                          onChange={(e) => setReenter(e.target.value)}
                          className="input w-full input-sm focus:outline-none focus:ring-2"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      {loading ? (
                        <button type="button" className="btn w-full btn-disabled">
                          加载中
                        </button>
                      ) : (
                        <button type="button" className="btn w-full bg-blue-300 hover:bg-blue-400 border-none text-gray-100" onClick={onSubmit}>
                          提交
                        </button>
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
