import { getRepository, getCustomRepository, In } from 'typeorm';

import csvParse from 'csv-parse';
import fs from 'fs';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'outcome' | 'income';
  category: string;
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const readCSVStream = fs.createReadStream(filePath);

    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const csvRecords: Request[] = [];

    parseCSV.on('data', line => {
      const [title, type, value, category] = line.map((item: string) =>
        item.trim(),
      );

      csvRecords.push({
        title,
        type,
        value: +value,
        category,
      });
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    const categoryTitles = csvRecords.map(record => record.category);

    const categoriesOnDB = await categoriesRepository.find({
      where: In(categoryTitles),
    });

    const categoryTitlesOnDB = categoriesOnDB.map(c => c.title);

    const newCategories = categoryTitles
      .filter(category => !categoryTitlesOnDB.includes(category))
      .filter((newCategory, index, self) => {
        return self.indexOf(newCategory) === index;
      })
      .map(newCategory => ({ title: newCategory }));

    const categoryEntities = categoriesRepository.create(newCategories);

    await categoriesRepository.save(categoryEntities);

    const transactionCategories = await categoriesRepository.find();

    const transactions = csvRecords.map(record => {
      return {
        ...record,
        category: transactionCategories.find(
          transactionCategory => transactionCategory.title === record.category,
        ),
      };
    });

    const transactionEntities = transactionsRepository.create(transactions);

    await transactionsRepository.save(transactionEntities);

    await fs.promises.unlink(filePath);

    return transactionEntities;
  }
}

export default ImportTransactionsService;
