// src/navigation/types.ts
import { Word } from '../services/wordService';

export type AdminStackParamList = {
  AdminPanel: undefined;
  ManageWordsScreen: undefined;
  EditWordScreen: { word: Word };
  ViewUsersScreen: undefined;
  ManageSubscriptionScreen: undefined;
};

export type MainTabParamList = {
  Search: undefined;
  Favourite: undefined;
  Subscribe: undefined;
  Profile: undefined;
};
