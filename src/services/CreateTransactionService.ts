import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import TransactionRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string,
  value: number,
  type: 'outcome' | 'income',
  category: string
}

class CreateTransactionService {
  public async execute({ title, value, type, category }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);

    let categoryData = await categoryRepository.findOne({ where: { title: category } });

    if (!categoryData) {
      categoryData = categoryRepository.create({ title: category });
      await categoryRepository.save(categoryData);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: categoryData.id
    });

    const balance = await transactionsRepository.getBalance();

    console.log('transaction value: ', transaction.value);
    console.log('transaction type: ', transaction.type);
    console.log('total balance: ', balance.total);

    if (transaction.type === 'outcome') {

      if (balance.total - transaction.value < 0) {
        throw new AppError('Invalid balance');
      }

    }

    await transactionsRepository.save(transaction);

    return transaction;

  }
}

export default CreateTransactionService;
