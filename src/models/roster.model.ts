import { Asset } from './object.model';
import { Breadcrumbs } from './app.model';

export type Visible = 'hidden'|'public'|'friends';
export class Roster {
  public slug?: string = '';
  public key: string = '';
  public roster_id?: string = '';
  public user_id?: string = '';

  public authors?: string[] = [];
  public visible?: Visible = 'hidden';
  public locked?: boolean = false;
  public viewMode?: 'table'|'card'|'list'|'inventory' = 'inventory';

  public created_at?: string;
  public updated_at?: string;
  public deleted_at?: string;
  
  public rulebook: RosterRulebook = new RosterRulebook();

  public processed?: {
    registry?: Asset;
  };

  public history: RosterHistory = new RosterHistory();
  public snapshot?: Asset = {item: 'Roster§Roster'};
}

export class RosterHistory {
  past: RosterHistoryItem[] = [];
  present: RosterHistoryItem = new RosterHistoryItem();
  subsequent: RosterHistoryItem[] = [];
}

export class RosterHistoryItem {
  note: string;
  id: Breadcrumbs;
  updated_at: string;
  noErrors?: boolean = false;
  rulebookSlug?: string;
  roster: Asset = {item: 'Roster§Roster'};
}

export class RosterRulebook {
  public hash?: string;
  public name?: string;
  public dependencies?: string;
  public game?: string;
  public game_id?: string;
  public genre?: string;
  public notes?: string;
  public publisher?: string;
  public revision?: string;
  public url?: string;
  public outdated?: string|boolean;
}