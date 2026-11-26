export type HouseDepositAccount = {
  holderName: string;
  identityNumber: string;
  alias: string;
  bankName: string;
};

export function depositAccountFields(input: { holder: string; identity: string; alias: string; bank: string }): HouseDepositAccount {
  const holderName = input.holder.trim().replace(/\s+/g, " ");
  const identityNumber = input.identity.replace(/\D/g, "");
  const alias = input.alias.trim().replace(/\s+/g, " ");
  const bankName = input.bank.trim().replace(/\s+/g, " ");
  if (holderName.length < 2 || holderName.length > 80) throw new Error("Indicá el nombre del titular.");
  if (!/^[0-9]{4,12}$/.test(identityNumber)) throw new Error("Indicá el CI del titular.");
  if (alias.length < 3 || alias.length > 40) throw new Error("Indicá el alias de la cuenta.");
  if (bankName.length < 2 || bankName.length > 60) throw new Error("Indicá el banco.");
  return { holderName, identityNumber, alias, bankName };
}
