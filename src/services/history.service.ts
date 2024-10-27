import { AppDataSource } from '../config/data-source';
import { SearchHistory } from '../entity/history.entity';

const searchHistoryRepository = AppDataSource.getRepository(SearchHistory);

export const saveSearchHistory = async (userId: string, query: string) => {
  const searchHistory = new SearchHistory();
  searchHistory.userId = userId;
  searchHistory.query = query;

  await searchHistoryRepository.save(searchHistory);
};

export const getSearchHistoryByUserId = async (userId: string) => {
  return await searchHistoryRepository.find({
    where: { userId },
    order: { createdAt: 'DESC' },
  });
};
