import AppError from '../errors/AppError';
import { getCustomRepository, getRepository } from 'typeorm';
import Category from '../models/Category';
import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({title, value, type, category}: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionRepository);

    const {total} = await transactionsRepository.getBalance();

    const categoryRepository = getRepository(Category);

    if (type === "outcome" && total < value){
      throw new AppError("You don't have enough balance")
    }

    let transactionCategory = await categoryRepository.findOne({
      where: {title: category},
    });

    if (!transactionCategory) {
      transactionCategory = categoryRepository.create({
        title: category,
      });
      await categoryRepository.save(transactionCategory);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: transactionCategory,
    });
    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
