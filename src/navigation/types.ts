// src/navigation/types.ts
import { Word } from '../services/wordService';

export type AdminStackParamList = {
  AdminPanel: undefined;
  ManageWordsScreen: undefined;
  EditWordScreen: { word: Word };
  UpdateCustomerWordsScreen: undefined;
  DuplicateSyncScreen: undefined;
};

export type MainTabParamList = {
  Search: undefined;
  Favourite: undefined;
  Profile: undefined;
};
