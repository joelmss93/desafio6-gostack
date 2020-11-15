import { Router } from 'express';
import multer from 'multer';
import { getCustomRepository } from 'typeorm';

import uploadConfig from '../config/upload';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

interface Transaction {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionsRepository.find({
    relations: ['category'],
  });

  const balance = await transactionsRepository.getBalance();
  return response.json({ transactions, balance });
});

transactionsRouter.post('/transactions', async (request, response) => {
  const { title, value, type, category } = request.body;

  const createNewTransaction = new CreateTransactionService();

  const transaction = await createNewTransaction.execute({
    title,
    value,
    type,
    category,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const deleteTransaction = new DeleteTransactionService();
  await deleteTransaction.execute(id);

  return response.json({ status: 'ok' });
});

transactionsRouter.post('/import', async (request, response) => {
  const { id } = request.params;
  const deleteTransaction = new DeleteTransactionService();
  await deleteTransaction.execute(id);

  return response.json({ status: 'ok' });
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const importTransactions = new ImportTransactionsService();
    const transactions = await importTransactions.execute(request.file.path);

    return response.json({ transactions });
  },
);

export default transactionsRouter;
