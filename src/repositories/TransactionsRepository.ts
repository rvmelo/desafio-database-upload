/* eslint-disable no-shadow */
/* eslint-disable no-param-reassign */
import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const balance = transactions.reduce(
      (balance, transaction) => {
        if (transaction.type === 'outcome') {
          balance.outcome += +transaction.value;
          balance.total -= +transaction.value;
        } else {
          balance.income += +transaction.value;
          balance.total += +transaction.value;
        }

        return balance;
      },
      {
        income: 0,
        outcome: 0,
        total: 0,
      },
    );

    return balance;
  }
}

export default TransactionsRepository;
