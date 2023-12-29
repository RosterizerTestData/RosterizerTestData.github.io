import { Classification, Item, Asset, AssetError } from './object.model'
import { Breadcrumbs, ErrorType } from './app.model';

export class Rulebook {
  public slug: string = '';
  public key: string = '';
  public rulebook_id: string = '';
  public user_id: string = '';
  
  public hash: string = '';
  public locked: boolean = false;
  public source?: string = '';

  public created_at?: string;
  public updated_at?: string;
  public deleted_at?: string;

  public processed: {
    composedDependencies?: RulebookData,
    dependencies?: RulebookDependency[],
    assetInventory?: { [name: string]: Asset },
    assetMorphology?: {[name: string]: Classification},
    hierarchy?: {[name: string]: Hierarchy},
    unclassified?: string[],
    source?: {url?: string, data?: any},
    lineage?: RulebookDependency[],
    errors?: AssetError[],
  } = {};
  public history: RulebookHistory = new RulebookHistory();
}

export class RulebookHistory {
  public past: RulebookHistoryItem[] = [];
  public present: RulebookHistoryItem = new RulebookHistoryItem();
  public subsequent: RulebookHistoryItem[] = [];
}

export class RulebookHistoryItem {
  public name: string = '';
  public id?: string[] = ['assetCatalog','Roster'];
  public note?: string = 'Rulebook Created';
  public updated_at?: string = '';
  public updatedObject?: Breadcrumbs;
  public revision: string = '0.0.1';
  public wip: boolean = true;
  public isModule?: boolean;
  public dependencies?: RulebookDependency[];
  public game: string = '';
  public genre: string = 'generic';
  public publisher: string = '';
  public url: string = '';
  public notes: string = '';
  public source?: string;
  public rulebook: RulebookData = new RulebookData();
}

export class RulebookDependency {
  public slug: string = '';
  public name: string = '';
  public game: string = '';
  public source: string = '';
}
export class RulebookData {
  public assetTaxonomy: { [name: string]: Classification } = { };
  public assetCatalog: { [name: string]: Item } = { 'Roster§Roster': {}};
  public gameModes?: {} = {};
  public theme?: {} = {};
}

export class Hierarchy {
  [name: string]: Hierarchy;
}