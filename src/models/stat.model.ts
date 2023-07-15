import { Asset } from "./object.model";

export type StatVisibility = 'always' | 'normal' | 'active' | 'hidden';
export type StatType = 'numeric' | 'rank' | 'term';

export class StatFormat{
  value?: string | number | null; // The string value, or numerical value, or the rank currently selected. This is read only.
  customValue?: string | number; // Storage for value that is assigned but may not be legal. Only dynamic stats use custom values.
  statType?: StatType; // Denotes whether this stat is a string (term), number (numeric), or rank.
  dynamic?: boolean; // Sets whether the user can edit this stat's value.
  format?: string; // The text that this stat displays, has the ability to represent values and icons associated with this stat.
  min?: number; // The minimum value a stat is allowed to be. If the stat is out of this bound it alerts with an error. This also dis-allows incrementing and setting non-tracked dynamic stats below this value.
  max?: number; // The maximum value a stat is allowed to be. If the stat is out of this bound it alerts with an error. This also dis-allows incrementing and setting non-tracked dynamic stats above this value.
  icons?: string[]; // The icons (that can be) used by this stat.
  label?: string; // The name of this stat that is shown on the roster.
  statOrder?: number; // The ordering of stats within a group. If there is a tie then stats are ordered alphabetically. undefined & null are treated as 0.
  visibility?: StatVisibility; // Sets what visibility rules the roster should use for this stat.
  increment?: {value?: number}; // The amount a dynamic stat should increment by.
  group?: string; // The group of stats this stat is associated (displayed) with.
  groupOrder?: number; // The order this group of stats is displayed in. undefined & null are treated as 0. If set to a negative the group is displayed before the name and is visible even when the asset is terse.
  text?: string; // Text that is added to the parent asset.
  ranks?: {[rank: string]: RankFormat}; // The list of ranks this stat has.
  tracked?: boolean; // Denotes whether this value should be added to the ancestors of the parent asset.
  processed?: StatProcessed;
}

export class RankFormat {
  order?: number; // The array index of this rank.
  number?: number; // The numerical value this rank holds.
  term?: string; // The string value this rank holds.
  icons?: string[]; // The icons (that can be) used by this rank.
  traits?: RankTrait[]; // Traits that are added to the parent asset when this rank is selected, this can either be a a string that specifies an Item or a complete Asset.
  tracking?: RankTracking; // Stats that can have their values modified by selections of ranks.
  format?: string; // The text that this rank displays, has the ability to represent values and icons assosiated with this rank.
  hotkey?: string; // A hotkey that when this rank picker is active and is pressed activates this rank.
  text?: string; // Text that is added to the parent asset when this rank is selected.
  prepend?: boolean; // Whether to prepend the previous-ordered rank's text to this rank.
}
export interface RankTrait {
  path?: string[], // the asset's path to which the trait should be included
  trait: any, // string | Asset, // the trait to include // TODO avj validator bails when refs (Asset | BranchingPath) are allowed
  pathError?: boolean, // whether the current path is a problem (not aiming at a potential asset)
}
export interface RankTracking {
  [name:string]: number // the value to add
}

// default is the value as set by the manifest.
// original is the value as set by the user.
// current is what the value is calulcated to be, by bubbling up tracked stats and rules editing it.
export class StatProcessed{
  numeric:{
    default?: number;
    original?: number;
    current?: number;
  };
  rank:{
    default?: string;
    original?: string;
    current?: string;
  };
  term:{
    default?: string;
    original?: string;
    current?: string;
  };
  format:{
    default?: string;
    original?: string;
    current?: string;
  }
}
