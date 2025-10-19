import { BankingOperator } from './types';

export const AGENT_PHONE_NUMBER = '+8801700000000';

export const BANKING_OPERATORS: { value: BankingOperator; label: string }[] = [
  { value: BankingOperator.BKASH, label: 'bKash' },
  { value: BankingOperator.NAGAD, label: 'Nagad' },
  { value: BankingOperator.ROCKET, label: 'Rocket' },
];

// Final Telegram Configuration
export const TELEGRAM_BOT_TOKEN = '8462399272:AAGqOZLNh6bnuIVEdEUXtpF0b7MPXh4pMwk';
export const TELEGRAM_CHAT_ID = '8030227425';
