import { Classification, Item, Asset, AssetError } from './object.model'
import { Breadcrumbs, ErrorType } from './app.model';

export class Manifest {
  public slug: string = '';
  public key: string = '';
  public manifest_id: string = '';
  public user_id: string = '';
  
  public hash: string = '';
  public locked: boolean = false;

  public created_at?: string;
  public updated_at?: string;
  public deleted_at?: string;

  public processed: {
    composedDependencies?: ManifestData,
    dependencies?: ManifestDependency[],
    assetInventory?: { [name: string]: Asset },
    assetMorphology?: {[name: string]: Classification},
    hierarchy?: {[name: string]: Hierarchy},
    unclassified?: string[],
    source?: {url?: string, data?: any},
    lineage?: ManifestDependency[],
    errors?: AssetError[],
  } = {};
  public history: ManifestHistory = new ManifestHistory();
}

export class ManifestHistory {
  public past: ManifestHistoryItem[] = [];
  public present: ManifestHistoryItem = new ManifestHistoryItem();
  public subsequent: ManifestHistoryItem[] = [];
}

export class ManifestHistoryItem {
  public name: string = '';
  public id?: string[] = ['assetCatalog','Roster'];
  public note?: string = 'Manifest Created';
  public updated_at?: string = '';
  public updatedObject?: Breadcrumbs;
  public revision: string;
  public wip: boolean = true;
  public dependencies?: ManifestDependency[];
  public game: string = '';
  public genre: string = 'generic';
  public publisher: string = '';
  public url: string = '';
  public notes: string = '';
  public source?: string;
  public manifest: ManifestData = new ManifestData();
}

export class ManifestDependency {
  public slug: string = '';
  public name: string = '';
  public game: string = '';
}
export class ManifestData {
  public assetTaxonomy: { [name: string]: Classification } = { };
  public assetCatalog: { [name: string]: Item } = { 'Roster§Roster': {}};
  public gameModes?: {} = {};
  public theme?: {} = {};
}

export class Hierarchy {
  [name: string]: Hierarchy;
}