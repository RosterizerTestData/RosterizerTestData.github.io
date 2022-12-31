export interface PathOption{
  pathNode: string[],
  crumbs?: number[],
  assetCrumbs?: string[],
  current?: PathOptionTreeNode,
  possible: {[name: string]: {icon: string,tooltip: string}},
  warning?: string[];
}

export interface PathOptionTreeNode{
id?: string[],
tooltip?: string,
type?: PathNodeTypes[],
identifier?: boolean,
icon?: string,
writable?: Writability[],
descendants?: PathOptionTreeNode[];
}
export type PathNodeTypes = 'string' | 'Asset' | 'text' | 'number' | 'boolean' | 'path' | 'array' | 'object' | 'DivisionType' | 'AssetVisibility' | 'ItemType' | 'StatVis' | 'RuleResult' | 'RuleOperator' | 'RuleEquationOperator';
export type Writability = 'add' | 'remove' | 'set' | 'modify';

export const pathOptionTypes = {
DivisionType: ['traits','included'],
ItemType: ['conceptual', 'game piece', 'add-on'],
AssetVisibility: ['always', 'edited', 'active'],
StatVis: ['normal','always','active','hidden'],
RuleResult: ['warning', 'error', 'pass'],
RuleOperator: ['AND', 'OR', 'SUM'],
RuleEquationOperator: ['T/O', 'O/T', 'T*O', 'T+O', 'T-O', 'O-T'],
};

export const assetDescendants: PathOptionTreeNode[] = [
{
  id: ['designation', 'item', 'classification', 'templateClass'],        // KEYS: tracked, lineage, info, rules
  tooltip: 'Select assets that have properties matching this value',
  type: ['string'],
  icon: 'square-rounded-outline',
  identifier: true,
  descendants: [],
},
{
  id: ['text'],        // keywords (special, user-def), stats (special, user-def)
  tooltip: 'Select assets that have properties matching this value',
  type: ['string'],
  icon: 'form-textbox',
  identifier: true,
  descendants: [],
},
{
  id: ['quantity', 'index'],
  tooltip: 'Select assets that have properties matching this value',
  type: ['number'],
  icon: 'calculator',
  identifier: true,
  descendants: [],
},
{
  id: ['collapsed', 'custom'],
  tooltip: 'Select assets that have properties matching this value',
  type: ['boolean'],
  icon: 'toggle-switch-outline',
  identifier: true,
  descendants: [],
}
];
export const pathAssetTree: PathOptionTreeNode = {
id: [''],
type: ['string','Asset'],
icon: 'hexagon-slice-1',
tooltip: '',
descendants: [
  {
    id: ['assets'],
    tooltip: 'The <b>target</b>’s child <b>assets</b>s of either <b>division</b>: <b>trait</b> or <b>include</b>',
    type: ['string'],
    writable: ['remove'],
    identifier: true,
    icon: 'family-tree',
    descendants: assetDescendants,
  },
  {
    id: ['traits'],
    tooltip: 'The <b>target</b>’s child <b>trait</b>s',
    type: ['string'],
    writable: ['add','remove'],
    identifier: true,
    icon: 'file-tree',
    descendants: assetDescendants,
  },
  {
    id: ['included'],
    tooltip: 'The <b>target</b>’s child <b>include</b>s',
    type: ['string'],
    writable: ['remove'],
    identifier: true,
    icon: 'file-tree-outline',
    descendants: assetDescendants,
  },
]
};
export const pathOptionTree: PathOptionTreeNode = {
id: [''],
type: ['string','Asset'],
icon: 'hexagon-slice-1',
tooltip: '',
descendants: [
  {
    id: ['quantity'],
    tooltip: 'The quantity of the <b>target</b> <b>asset</b>',
    type: ['number'],
    icon: 'credit-card-multiple-outline',
    writable: ['set','modify'],
  },
  {
    id: ['classification'],
    tooltip: 'The <b>class</b> to which the <b>target</b> belongs',
    type: ['string'],
    icon: 'hexagon-slice-5',
  },
  {
    id: ['templateClass'],
    tooltip: 'The <b>class</b> from which the <b>target</b>’s <b>class</b> depends',
    type: ['string'],
    icon: 'flip-to-front',
  },
  {
    id: ['lineage'],
    tooltip: 'The <b>class</b>es from which the <b>target</b>’s <b>class</b> depends and its class templates depend',
    type: ['string','array'],
    icon: 'lock-pattern',
  },
  {
    id: ['item'],
    tooltip: 'The item key (in the form: <b>class</b>§<b>asset</b>) of the <b>target</b>',
    type: ['string'],
    icon: 'account-key-outline',
    writable: ['set'],
  },
  {
    id: ['designation'],
    tooltip: 'The display name of the <b>target</b>',
    type: ['string'],
    icon: 'account-outline',
    writable: ['set','modify'],
  },
  {
    id: ['division'],
    tooltip: 'Whether the <b>target</b> is a <b>trait</b> or an <b>include</b>',
    type: ['DivisionType'],
    icon: 'gate-or',
  },
  // { // TODO track original (editable) name separate from displayName for rule editing purposes
  //   id: ['name'],
  //   tooltip: '',
  //   type: ['string'],
  //   icon: 'account-edit',
  //   writable: ['modify'],
  // },
  {
    id: ['text'],
    tooltip: 'The game text of the <b>target</b>',
    type: ['text'],
    icon: 'format-align-left',
    writable: ['set','modify'],
  },
  {
    id: ['keywords'],
    tooltip: 'The <b>keyword</b> categories of the <b>target</b>',
    type: ['string','array'],
    writable: ['add','remove'],
    icon: 'tag-outline',
    descendants: [
      {
        id: ['Tags','Keywords',''],
        tooltip: 'The keywords within a particular category',
        type: ['string','array'],
        writable: ['add','remove'],
        icon: 'tag-multiple-outline',
      }
    ],
  },
  {
    id: ['tally'],
    tooltip: 'The count of how any of each <b>class</b>, <b>asset</b>, and <b>keyword</b> the <b>target</b>, and its descendents, contain',
    type: ['object'],
    icon: 'clipboard-list',
    descendants: [
      {
        id: [''],
        tooltip: '',
        writable: ['set','modify'],
        type: ['number'],
      }
    ],
  },
  {
    id: ['tracked'],
    tooltip: 'The count of any <b>tracked</b> <b>stat</b>s contained within the <b>target</b> or its descendents',
    type: ['object'],
    icon: 'clipboard-list-outline',
    descendants: [
      {
        id: [''],
        tooltip: '',
        writable: ['set','modify'],
        type: ['number'],
      }
    ],
  },
  {
    id: ['stats'],
    tooltip: 'The formatting of a <b>stat</b> that may be present in the <b>target</b>',
    type: ['object'],
    icon: 'poll',
    descendants: [
      {
        id: [''],
        tooltip: 'The <b>stat</b>’s name',
        type: ['string','number'],
        descendants: [
          {
            id: ['value'],
            tooltip: 'The value of the <b>stat</b>, as set by the <b>asset</b> or the user (in the case of <b>dynamic</b> <b>stat</b>s)',
            type: ['string','number'],
            icon: '',
            writable: ['set','modify'],
          },
          {
            id: ['increment'],
            tooltip: 'The value by which the user can increment/decrement the <b>stat</b> within the roster',
            type: ['number'],
            writable: ['set','modify'],
            icon: 'plus-minus',
          },
          {
            id: ['min','max'],
            tooltip: 'The bounds of the <b>stat</b>',
            type: ['number'],
            icon: '',
            writable: ['set','modify'],
          },
          {
            id: ['statOrder','groupOrder'],
            tooltip: 'The display order of the <b>stat</b> or its group',
            type: ['number'],
            icon: '',
            writable: ['set','modify'],
          },
          {
            id: ['group'],
            tooltip: 'The group to which the <b>stat</b> belongs',
            type: ['string'],
            icon: '',
            writable: ['set','modify'],
          },
          {
            id: ['label'],
            tooltip: 'The display name of the <b>stat</b>, if different from its name',
            type: ['string'],
            icon: '',
            writable: ['set','modify'],
          },
          {
            id: ['text'],
            tooltip: 'The text that will be appended to the <b>stat</b>’s contaiing <b>asset</b>',
            type: ['string'],
            icon: '',
            writable: ['set','modify'],
          },
          {
            id: ['format'],
            tooltip: 'The format string used by the <b>stat</b> to display its value',
            type: ['string'],
            icon: '',
            writable: ['set','modify'],
          },
          {
            id: ['icons'],
            tooltip: 'The <b>icon</b>s associated with a particular stat',
            type: ['string'],
            writable: ['add','remove'],
            icon: '',
          },
          {
            id: ['dynamic'],
            tooltip: 'Whether the user will be able to change the <b>stat</b>’s via a dropdown',
            type: ['boolean'],
            icon: '',
            writable: ['set'],
          },
          {
            id: ['tracked'],
            tooltip: 'Whether the <b>stat</b>’s value will be tracked by its containing <b>asset</b>’s ancestors',
            type: ['boolean'],
            icon: '',
            writable: ['set'],
          },
          {
            id: ['visibility'],
            tooltip: 'The visibility options of the <b>stat</b>',
            type: ['StatVis'],
            icon: '',
            writable: ['set'],
          },
          {
            id: ['processed'],
            tooltip: 'The default, original, and current processed values of the <b>stat</b>',
            type: ['object'],
            icon: '',
            descendants: [
              {
                id: ['numeric'],
                tooltip: 'The default, original, and current processed numbers of the <b>stat</b>',
                type: ['object'],
                icon: '',
                descendants: [
                  {
                    id: ['default'],
                    tooltip: 'The number, as determined by the <b>asset</b>',
                    type: ['number'],
                    icon: '',
                  },
                  {
                    id: ['original'],
                    tooltip: 'The number, as determined by the user, if applicable',
                    type: ['number'],
                    icon: '',
                  },
                  {
                    id: ['current'],
                    tooltip: 'The number, as determined by any tracked stats or rules',
                    type: ['number'],
                    icon: '',
                    writable: ['set','modify'],
                  }
                ],
              },
              {
                id: ['rank'],
                tooltip: 'The default, original, and current processed rank indices of the <b>stat</b>',
                type: ['object'],
                icon: '',
                descendants: [
                  {
                    id: ['default'],
                    tooltip: 'The value, as determined by the <b>asset</b>',
                    type: ['string'],
                    icon: '',
                  },
                  {
                    id: ['original'],
                    tooltip: 'The value, as determined by the user, if applicable',
                    type: ['string'],
                    icon: '',
                  },
                  {
                    id: ['current'],
                    tooltip: 'The value, as determined by any tracked stats or rules',
                    type: ['string'],
                    icon: '',
                  }
                ],
              },
              {
                id: ['term'],
                tooltip: 'The default, original, and current processed terms of the <b>stat</b>',
                type: ['object'],
                icon: '',
                descendants: [
                  {
                    id: ['default'],
                    tooltip: 'The value, as determined by the <b>asset</b>',
                    type: ['string'],
                    icon: '',
                  },
                  {
                    id: ['original'],
                    tooltip: 'The value, as determined by the user, if applicable',
                    type: ['string'],
                    icon: '',
                  },
                  {
                    id: ['current'],
                    tooltip: 'The value, as determined by any tracked stats or rules',
                    type: ['string'],
                    icon: '',
                    writable: ['set','modify'],
                  }
                ],
              },
              {
                id: ['format'],
                tooltip: 'The default, original, and current processed formatted display strings of the <b>stat</b>',
                type: ['object'],
                icon: '',
                descendants: [
                  {
                    id: ['default'],
                    tooltip: 'The value, as determined by the <b>asset</b>',
                    type: ['string'],
                    icon: '',
                  },
                  {
                    id: ['original'],
                    tooltip: 'The value, as determined by the user, if applicable',
                    type: ['string'],
                    icon: '',
                  },
                  {
                    id: ['current'],
                    tooltip: 'The value, as determined by any tracked stats or rules',
                    type: ['string'],
                    icon: '',
                  }
                ],
              }
            ],
          },
        ],
      }
    ],
  },
  {
    id: ['allowed'],
    tooltip: 'The <b>class</b>es or <b>asset</b>s allowed to be included in the <b>target</b>',
    type: ['object'],
    icon: 'allowedSettings',
    descendants: [
      {
        id: ['classifications','items'],
        tooltip: '',
        type: ['string'],
        writable: ['add','remove'],
        icon: '',
      }
    ],
  },
  {
    id: ['disallowed'],
    tooltip: 'The <b>class</b>es or <b>asset</b>s that are not allowed to be <b>includ</b>ed, whether or not their <b>class</b> allows them',
    type: ['object'],
    icon: 'allowedSettings',
    descendants: [
      {
        id: ['classifications','items'],
        tooltip: '',
        type: ['string'],
        writable: ['add','remove'],
        icon: '',
      }
    ],
  },
  {
    id: ['assets'],
    tooltip: 'The <b>target</b>’s child <b>assets</b>s of either <b>division</b>: <b>trait</b> or <b>include</b>',
    type: ['string'],
    writable: ['remove'],
    identifier: true,
    icon: 'family-tree',
    descendants: assetDescendants,
  },
  {
    id: ['traits'],
    tooltip: 'The <b>target</b>’s child <b>trait</b>s',
    type: ['string','Asset'],
    writable: ['add','remove'],
    identifier: true,
    icon: 'file-tree',
    descendants: assetDescendants,
  },
  {
    id: ['included'],
    tooltip: 'The <b>target</b>’s child <b>include</b>s',
    type: ['string'],
    writable: ['remove'],
    identifier: true,
    icon: 'file-tree-outline',
    descendants: assetDescendants,
  },
  // {
  //   id: ['{ancestor}'],
  //   tooltip: '',
  //   type: ['array'],
  //   writable: ['remove'],
  //   identifier: true,
  //   icon: 'arrow-up-bold-hexagon',
  //   descendants: assetDescendants,
  // },
  // {
  //   id: ['{descendant}'],
  //   tooltip: '',
  //   type: ['array'],
  //   writable: ['remove'],
  //   identifier: true,
  //   icon: 'arrow-down-bold-hexagon',
  //   descendants: assetDescendants,
  // },
  // {
  //   id: ['info'],
  //   tooltip: '',
  //   type: ['object'],
  //   icon: 'info',
  //   writable: ['add','remove'],
  //   descendants: [
  //     {
  //       id: [''], // info service?
  //       tooltip: '',
  //       type: ['string','text'],
  //       icon: '',
  //       writable: ['set','modify'],
  //     }
  //   ],
  // },
  {
    id: ['aspects'],
    tooltip: 'The <b>target</b>’s characteristic aspects',
    type: ['object'],
    icon: 'format-list-checks',
    descendants: [
      {
        id: ['Type'],
        tooltip: 'Whether the <b>target</b> is a physical game piece, or a nonphysical concept',
        icon: '',
        type: ['ItemType'],
        writable: ['set'],
      },
      {
        id: ['Visibility'],
        tooltip: 'The visibility options of the <b>target</b>',
        icon: '',
        type: ['AssetVisibility'],
        writable: ['set'],
      },
      {
        id: ['Rename','Describe','Lock Qty','Unique','Collapse','Group Traits','Order Traits A–Z','Group Includes','Order Includes A–Z'],
        tooltip: 'A true/false aspect of the <b>target</b>',
        type: ['boolean'],
        icon: '',
        writable: ['set'],
      }
    ],
  },
  {
    id: ['collapsed'],
    tooltip: 'Whether the <b>target</b> is currently collapsed.',
    type: ['boolean'],
    icon: 'arrow-collapse-vertical',
  },
  {
    id: ['custom'],
    tooltip: 'Whether the <b>target</b> is a custom (user-defined) asset',
    type: ['boolean'],
    icon: 'card-bulleted-settings-outline',
  },
  {
    id: ['rules'],
    tooltip: 'The formatting of a <b>rule</b> that may be present in the <b>target</b>',
    type: ['object'],
    icon: 'ruler',
    descendants: [
      {
        id: [''],
        tooltip: 'The <b>rule</b>’s name',
        type: ['object'],
        icon: '',
        descendants: [
          {
            id: ['order'],
            tooltip: 'The order of execution of the <b>rule</b>',
            type: ['number'],
            icon: '',
          },
          {
            id: ['failState'],
            tooltip: 'What happens when the <b>rule</b> fails',
            type: ['RuleResult'],
            icon: '',
          },
          {
            id: ['return'],
            tooltip: 'The value returned by the <b>rule</b>’s evaluations',
            type: ['string','number'],
            icon: '',
          },
          {
            id: ['evals'],
            tooltip: 'The evaluations associated with the <b>rule</b>',
            type: ['array'],
            icon: '',
            descendants: [
              {
                id: [''],
                tooltip: 'The <b>eval</b>’s numerical index',
                type: ['number'],
                icon: '',
                descendants: [
                  {
                    id: ['min','max'],
                    tooltip: 'The bounds of the <b>eval</b>',
                    type: ['number'], // how to eval a branching path here?
                    icon: '',
                  },
                  {
                    id: ['value'],
                    tooltip: 'The comparison value of the <b>eval</b>',
                    type: ['string','boolean','number'], // how to eval a branching path here?
                    icon: '',
                  },
                  {
                    id: ['not'],
                    tooltip: 'Whether to use the logical inverse of the result of the <b>rule</b>’s <b>eval</b>',
                    type: ['boolean'],
                    icon: '',
                  },
                  {
                    id: ['actionable'],
                    tooltip: 'Whether to: report failures of this <b>eval</b>, if applicable; and/or perform the <b>rule</b>’s actions, if any',
                    type: ['boolean'],
                    icon: '',
                  },
                  {
                    id: ['operator'],
                    tooltip: 'The boolean operator to apply to the results of each <b>path</b>',
                    type: ['RuleOperator'],
                    icon: '',
                  },
                  {
                    id: ['equation'],
                    tooltip: 'The arithmetic equation to apply to the results of the <b>eval</b>',
                    type: ['object'],
                    icon: '',
                    descendants: [
                      {
                        id: ['operator'],
                        tooltip: 'The arithmetic operator to use in the equation',
                        type: ['RuleEquationOperator'],
                        icon: '',
                      },
                      {
                        id: ['value'],
                        tooltip: 'The second value (operand) to use in the equation',
                        type: ['number'],
                        icon: '',
                      }
                    ],
                  },
                  {
                    id: ['result'],
                    tooltip: 'The <b>eval</b>’s collection of processed results',
                    type: ['object'],
                    icon: '',
                    descendants: [
                      {
                        id: ['integer','float','remainder'],
                        tooltip: 'Result in number form',
                        type: ['number'],
                        icon: '',
                      },
                      {
                        id: ['string'],
                        tooltip: 'Result in string form',
                        type: ['string'],
                        icon: '',
                      },
                      {
                        id: ['truthy'],
                        tooltip: 'Result in boolean form',
                        type: ['boolean'],
                        icon: '',
                      }
                    ],
                  }
                ],
              }
            ],
          }
        ],
      }
    ],
  }
]
};