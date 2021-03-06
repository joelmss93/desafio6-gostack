import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface RequestDTO {
  title: string;
  category: string;
  value: number;
  type: 'income' | 'outcome';
}

class CreateTransactionService {
  public async execute({
    title,
    category,
    value,
    type,
  }: RequestDTO): Promise<Transaction> {
    const categoryRepository = getRepository(Category);
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const balance = await transactionsRepository.getBalance();
    if (type === 'outcome' && value > balance.total) {
      throw new AppError('You dont have enought money');
    }

    let findCategory = await categoryRepository.findOne({
      where: { title: category },
    });
    if (!findCategory) {
      findCategory = categoryRepository.create({ title: category });
      await categoryRepository.save(findCategory);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      categoryId: findCategory.id,
    });
    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
