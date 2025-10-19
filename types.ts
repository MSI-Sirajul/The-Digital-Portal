export enum BankingOperator {
  BKASH = 'bKash',
  NAGAD = 'Nagad',
  ROCKET = 'Rocket',
}

export interface FormData {
  amount: string;
  senderNumber: string;
  transactionId: string;
  senderOperator: BankingOperator;
  receiverNumber: string;
}

export interface Transaction extends FormData {
  id: string;
  date: string;
}

export interface User {
  uid: string;
  identifier: string; // email or phone
  passwordHash: string; // In a real app, this would be a hash. Here it's a simple string for simulation.
  transactions: Transaction[];
}
