import { StatFormat } from "./stat.model";
import { RuleFormat } from "./rule.model";
import { Breadcrumbs, ErrorType } from "./app.model";

export type AssetVisibility = 'always' | 'edited' | 'active';
export class AssetError {
  type?: ErrorType;
  breadcrumbs: Breadcrumbs;
  name?: string;
  message?: string = '';
}
export class AssetKeys {
  group: {};
  hidden: string[];
}

export class Base {
  public keywords?: {[keyCat: string]: string[]} = {};
  public stats?: {[name:string]: StatFormat} = {};
  public assets?: {
    included?: any[];
    traits?: any[];
  } = {};
  public allowed?: {
    classifications?: string[],
    items?: string[],
    keywordsAny?: string[],
    keywordsAll?: string[],
  } = {};
  public disallowed?: {
    classifications?: string[],
    items?: string[],
    keywordsAny?: string[],
    keywordsAll?: string[],
  } = {};
  public constraints?:{
    any?: string[],
    all?: string[],
    none?: string[],
    not?: string[],
  } = {};
  public meta?: {[name:string]:any} = {};
  public text?: string = '';
  public rules?: {[name: string]: RuleFormat} = {};
  public aspects?: ItemAspects = {};
}
export class Classification extends Base {
  public templateClass?: string;
  public lineage?: string[];
  public legacy?: string[];
  public inherited?: Base;
  public removed?: Base;
  public net?: Base;
  public current?: Base;
  public inheritance?: 'removed'|'inherited'|'modified';
}

export class ItemAspects {
  public Type?: ItemType = 'conceptual';
  public Visibility?: AssetVisibility = 'always';
  public 'Group By'?: string = null;
  public 'Lock Qty'?: boolean = false;
  public Unique?: boolean = false;
  public Rename?: boolean = false;
  public Describe?: boolean = false;
  public Collapse?: boolean = false;
  public 'Group Traits'?: boolean = false;
  public 'Order Traits A–Z'?: boolean = false;
  public 'Group Includes'?: boolean = false;
  public 'Order Includes A–Z'?: boolean = false;
}

export type ItemType = 'conceptual' | 'game piece' | 'add-on';

export class Item extends Classification {
  public bareResource?: Asset;
}

export class Asset extends Item {
  public item: string = '';
  public classification?: string = '';
  public classIdentity?: string = '';
  public designation?: string = '';
  public id?: string = '';
  public quantity?: number = 1;
  public originalQty?: number;
  public name?: string;
  public description?: string;

  public ruled?: RuleFormat[] = [];
  public tracked?: {[name:string]: number} = {};
  public tally?: {[name:string]: number} = {};

  public breadcrumbsRoster?: Breadcrumbs;
  public breadcrumbsRegistry?: Breadcrumbs;
  public bareAsset?: Asset;
  public parent?: Asset;
  public siblings?: Asset[];
  public twinsList?: Asset[];
  public classes?: string = '';
  public errors?: AssetError[] = [];
  
  public collapsed?: boolean;
  public claimed?: Breadcrumbs;
  public traitOrder?: string[];
  public index?: number = 0;
  public division?: 'traits' | 'included' | 'roster';
  public custom?: boolean = false;
  public visible?: boolean;
  public stattable?: boolean;
  public container?: boolean;
  public emptyAsset?: boolean;
  public assetKeys?: AssetKeys;
  public assetsDisplay?: {[name:string]: {[name:string]: Asset[]}};
}