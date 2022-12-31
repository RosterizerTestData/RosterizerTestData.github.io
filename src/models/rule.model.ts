import { Breadcrumbs } from './app.model';
import { Asset } from './object.model';
import { PathOptionTreeNode } from './pathOptions.model';
export type BranchingPath = (string | string[])[];
export type RuleOperator = 'AND' | 'OR' | 'SUM';
export type RuleResult = 'warning' | 'error' | 'disable' | 'hide' | 'pass' | false;
export type RuleActionType = 'add' | 'remove' | 'set' | 'modify' | null;
export type RuleSuccessValue = any; // | boolean | number | string | Asset | BranchingPath; // TODO avj validator bails when refs (Asset | BranchingPath) are allowed
export type TargetContainer = {
  target: any, 
  props: {
    name: string,
    self: Asset,
    targetAsset: Asset,
    location: {division: string, index: number},
    options?: PathOptionTreeNode,
    action?: RuleAction,
    bareAsset?: Asset,
    path: string[],
  }
}
export type RuleAction = {
  actionType: RuleActionType,
  paths: BranchingPath[],
  value?: RuleSuccessValue,
  iterations?: number | BranchingPath,
  note?:string,
}
export type RuleEquation = {
  operator:  'T/O' | 'O/T' | 'T*O' | 'T+O' | 'T-O' | 'O-T',
  value: number | BranchingPath,
}
export type RuleEval = {
  paths: BranchingPath[];
  max?: number | BranchingPath | null,
  min?: number | BranchingPath | null,
  value?: number | boolean | string | BranchingPath,
  contains?: boolean,
  operator?: RuleOperator,
  not?: boolean,
  actionable?: boolean,
  equation?: RuleEquation, //this equation modifies return value, TBD how.
  note?: string;
  result?: {
    integer?: number,
    float?: number,
    remainder?: number,
    string?: string,
    truthy?: boolean
  }
}
export class RuleFormat {
  name?: string;
  asset?: Asset; //the asset the rule is attached to
  source?: Breadcrumbs;
  problem?: boolean;
  order?: number;
  evals?: RuleEval[] = [];
  failState?: RuleResult = 'pass';
  evaluate?: RuleOperator = 'AND';
  return?: string | number;
  actions?: RuleAction[];
  evalTargets?: TargetContainer[][];
  actionTargets?: TargetContainer[];
  flat?: RuleFormat;
}

export class RegistryRules {
  [order: string]: {
    [type: string]: any
  }
}
export class RuleDelta {
  public tracked?:{[name:string]:number} = {};
  public tally?:{[name:string]:number} = {};
}

//An example of a rule

// "There are multiple of this unique model": {
//   "evals": [
//     {
//       "paths": [["{self}", "designation"]],
//       "actionable": false
//     },
//     {
//       "paths": [["{roster}","tally","{0string}"]],
//       "max": 1,
//       "not": true,
//       "actionable": false
//     },
//     {
//       "paths": [["{self}", "aspects", "Unique"], ["{self}", "rules", "There are multiple of this unique model", "evals", 1, "result", "truthy"]],
//       "max": 1,
//       "operator": "SUM"
//     }
//   ],
//   "failState": "error"
// }


// "Close Combat, Ranged Combat, and Movement must equal to first sibling with classification of Character's Close Combat ": {
//   "paths": [ // paths must be an array of branching paths, even if only one path is being used
//     [
//       "<self>",
//       "stats",
//       [
//         "Ranged Combat",
//         "Close Combat"
//       ]
//     ],
//     [
//       "<self>",
//       "stats",
//       "Movement"
//     ]
//   ],
//   "eval": { // eval variables only take the first valid value, and unlike paths can only hold one branching path (or a string or number)
//     "value": [ 
//       "<parent>",
//       "included",
//       "classification",
//       "Character",
//       "stats",
//       "Close Combat"
//     ]
//   },
//   "failState": "disable"
// }

//Ship:
// "Rebel fleets can only contain rebel ships": {
//   "paths": [["<roster>","stat","faction"]],
//   "eval": {
//     "value": "rebel"
//   },
//   "failState": "hide"
// },
//Crew:
// "Unique crew cannot be duplicated": {
//   "paths": [["<roster>","tally","<name>"],["<self>","variables","unique"]],
//   "eval": {
//     "min": 2,
//     "not": true
//   },
//   "failState": "disable"
// }
// "designation": {
//   "order": 0,
//   "actions":[{
//      "actionType": "setValue",
//      "path": ["<self>","variables","name"],
//      "value": ["<self>","designation"]
//   }]
// }
// "unique": {
//   "order": 0,
//   "paths": [["<self>","aspects","Unique"]],
//   "eval": {
//     "value": 1
//   },
//   "actions":[{
//      "actionType": "setValue",
//      "path": ["<self>","variables","unique"],
//      "value": 2
//   }]
// }


// "No Void Demon": {
//   path: ["<self>","tally","Void Demon"],
//   eval: {
//     max: 0
//   }
// },
// "Philosophy is The Empty": {
//   path: ["<self>","stats","Philosophy"],
//   eval: {
//     value: "The Empty"
//   }
// },
// "Add a Void Demon": {
//   path: ["<self>","rules",["No Void Demon","Philosophy is The Empty"]],
//   eval: {
//     min 2
//   }
//   actions: [{
//     action: "addAsset",
//     path: ["<self>","traits"],
//     value: "Devout§Void Demon"
//   }]
// },
// "Remove myself–Void Demon": {
//   path: ["<roster>","rules",["Philosophy is Lords of Hell","Philosophy is Earth-Bound","Philosophy is Demented","Philosophy is Brokers","Philosophy is Judges"]],
//   eval: {
//     min 1
//   }
//   actions: [{
//     action: "removeAsset",
//     path: ["<self>"]
//   }]
// },


// "Rocket Launcher Slots": {
//   path: ["<self>"],
//   eval: {
//     operator: "/10"
//   }
//   return: "hide"
// }


// "This weapon can only be included in an unmodified Ork": {
//   path:["<parent>","tally","included"],
//   eval: {
//     max:0
//   }
//   failState: "disable"
// }


// "Incorrect arena selected": {
//   path: ["<roster>","stats","Arena","value"],
//   eval: {
//     min: ["<self>","stats","Arena","value"],
//     operator: "NOT"
//   }
//   return: "hide"
// }

// {
//   current: point to registry
//   parent: null
//   assets: [
//     {
//       current: point to asset
//       parent: point up one
//       assets: [
//         {...}
//       ]
//     }
//     ...
//   ]
// }

// AND - All must be true
// Not AND - All cannot be true
// OR - some must be true
// not OR - some cannot be true (all must be false)
// sum - combined value must be true
// not sum - combined value cannot be true