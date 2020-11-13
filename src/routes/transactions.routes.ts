import { Router } from 'express';
import { getCustomRepository, getRepository, Transaction, TransactionRepository } from 'typeorm';

import multer from 'multer';
import uploadConfig from '../config/upload';
import Category from '../models/Category';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const upload = multer(uploadConfig);

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  const categoryRepository = getRepository(Category);

  const balance = await transactionsRepository.getBalance();

  const transactions = await transactionsRepository.find();

  const categories = await categoryRepository.find();

  const transactionsList = transactions.map(transaction => {
    return {
      id: transaction.id,
      title: transaction.title,
      value: transaction.value,
      type: transaction.type,
      category: categories.find(c => c.id === transaction.category_id),
      created_at: transaction.created_at,
      updated_at: transaction.updated_at,
    }
  })

  return response.json({ transactions: transactionsList, balance });

});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const createTransactionService = new CreateTransactionService();

  const transaction = await createTransactionService.execute({ title, value, type, category });

  return response.json(transaction);

});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const deleteTransactionService = new DeleteTransactionService();

  await deleteTransactionService.execute({ id });

  return response.sendStatus(204);

});

transactionsRouter.post('/import', upload.single('file'), async (request, response) => {
  const importTransactionService = new ImportTransactionsService();

  const transactions = await importTransactionService.execute(request.file.path);

  response.json(transactions);

});

export default transactionsRouter;
