import { Component, HostListener, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Manifest, ManifestHistoryItem } from 'src/models/manifest.model';
import { Asset, Item } from 'src/models/object.model';
import * as xml2js from 'xml2js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit {
  @HostListener('document:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if(event.key === 'Enter'){
      this.onTranslate();
    }
  }
  title = 'battlescribe-to-rosterizer';
  urlField: FormControl = new FormControl('');
  parser;
  manifest: Manifest;
  mhp: ManifestHistoryItem;
  clipped: boolean = false;

  constructor() {
    this.parser = new xml2js.Parser({ strict: false, trim: true });
    this.onTranslate = this.onTranslate.bind(this)
  }
  ngOnInit(){
  }
  
  onTranslate(){
    fetch(this.urlField.value).then((res) => res.text()).then((body) => {
      this.parser.parseString(body, (err, result) => {
        let IDResult = this.findIDs(result)
        this.manifest = new Manifest;
        this.mhp = this.manifest.history.present;
        delete this.mhp.id;
        delete this.mhp.note;
        delete this.mhp.updatedObject;
        delete this.mhp.updated_at;
        delete this.mhp.source;
        console.log(JSON.parse(JSON.stringify(this.mhp)))
        this.mhp.notes = 'This data was translated automatically from a battlescribe catalog. Only asset names and bare stats have been translated and considerable editing is required in order for it to become useful in Rosterizer.';
        console.log(result);
        console.log(IDResult);
        ['CATALOGUE','GAMESYSTEM'].forEach(topLevel => {
          Object.keys(result[topLevel] || {})?.forEach(subCat => {
            let subCats = result[topLevel][subCat];
            if(!Array.isArray(subCats)){
              this.mhp.name = subCats.NAME;
            }else{
              switch (subCat) {
                case 'FORCEENTRIES':
                  subCats.forEach(element => {
                    element.FORCEENTRY?.forEach(forceEntry => {
                      this.mapForceEntries('Roster§Roster',forceEntry);
                    });
                  });
                  break;
                case 'CATEGORYLINKS':
                  if(topLevel === 'GAMESYSTEM'){
                    subCats.forEach(element => {
                      element.ENTRYLINK?.forEach(entryLink => {
                        this.mapMasterEntryLink('Roster§Roster',entryLink,IDResult);
                      });
                    });
                  }
                  break;
                case 'ENTRYLINKS':
                  if(topLevel === 'GAMESYSTEM'){
                    subCats.forEach(element => {
                      element.ENTRYLINK?.forEach(entryLink => {
                        this.mapMasterEntryLink('Roster§Roster',entryLink,IDResult);
                      });
                    });
                  }
                  break;
                case 'SHAREDPROFILES':
                  subCats.forEach(element => {
                    element.PROFILE?.forEach(profile => {
                      this.mapProfile(profile);
                    });
                  });
                  break;
                case 'SHAREDRULES':
                  subCats.forEach(element => {
                    element.RULE?.forEach(rule => {
                      this.mapRule(rule);
                    });
                  });
                  break;
                case 'SHAREDSELECTIONENTRIES':
                  subCats.forEach(element => {
                    element.SELECTIONENTRY?.forEach(selection => {
                      console.log(subCat,selection)
                      this.mapSelection(selection,result,IDResult,1);
                    });
                  });
                  break;
                case 'SHAREDSELECTIONENTRYGROUPS':
                  subCats.forEach(element => {
                    element.SELECTIONENTRYGROUP?.forEach(group => {
                      let classOverride = group.$.NAME
                      console.log(subCat,classOverride,group)
                      group.SELECTIONENTRIES?.forEach(element => {
                        element.SELECTIONENTRY.forEach(selection => {
                          this.mapSelection(selection,result,IDResult,1,classOverride);
                        });
                      });
                    });
                  });
                  break;
                default:
                  break;
              }
            }
          });
        });
        this.orderManifest(this.manifest);
        this.clipped = false;
        // console.log(this.mhp)
      });
    });
  }
  onClip(){
    window.navigator['clipboard'].writeText(JSON.stringify(this.mhp, null, 4));
    this.clipped = true;
  }
  mapProfile(profile){
    let itemClass = this.ucFirst(profile.$.TYPENAME);
    let itemDesignation = this.ucFirst(profile.$.NAME);
    let itemKey = itemClass + '§' + itemDesignation;
    this.mhp.manifest.assetTaxonomy[itemClass] = this.mhp.manifest.assetTaxonomy[itemClass] || {};
    this.mhp.manifest.assetCatalog[itemKey] = this.mhp.manifest.assetCatalog[itemKey] || {};
    profile.CHARACTERISTICS?.forEach(char => {
      char.CHARACTERISTIC?.forEach(stat => {
        this.mapStats(stat,itemKey);
      });
    });
  }
  mapRule(rule){
    let itemClass = 'Rule';
    let itemDesignation = this.ucFirst(rule.$.NAME);
    let itemKey = itemClass + '§' + itemDesignation;
    this.mhp.manifest.assetTaxonomy[itemClass] = this.mhp.manifest.assetTaxonomy[itemClass] || {};
    this.mhp.manifest.assetCatalog[itemKey] = this.mhp.manifest.assetCatalog[itemKey] || {};
    this.mhp.manifest.assetCatalog[itemKey].text = rule.DESCRIPTION.join('\n\n');
  }
  mapInfoLink(itemKey,infoLink,IDResult){
    let traitClass = this.ucFirst(IDResult[IDResult[infoLink.$.TARGETID]?.ID]?.$.TYPE || IDResult[IDResult[infoLink.$.TARGETID]?.ID]?.$.TYPENAME || IDResult[infoLink.$.TARGETID]?.$.TYPE || IDResult[infoLink.$.TARGETID]?.$.TYPENAME || infoLink.$.TYPE || infoLink.$.TYPENAME);
    let traitDesignation = this.ucFirst(infoLink.$.NAME);
    let traitKey = traitClass + '§' + traitDesignation;
    // console.log(itemKey,traitKey,infoLink,IDResult)
    if(infoLink.$.TYPE === 'profile'){
      let profile = IDResult[infoLink.$.TARGETID];
      // console.log(profile)
      profile.CHARACTERISTICS?.forEach(element => {
        element.CHARACTERISTIC?.forEach(stat => {
          this.mapStats(stat, itemKey);
        });
      });
    }else{
      this.mhp.manifest.assetTaxonomy[traitClass] = this.mhp.manifest.assetTaxonomy[traitClass] || {};
      this.mhp.manifest.assetCatalog[traitKey] = this.mhp.manifest.assetCatalog[traitKey] || {};
      this.mhp.manifest.assetCatalog[itemKey] = this.mhp.manifest.assetCatalog[itemKey] || {};
      this.mhp.manifest.assetCatalog[itemKey].assets = this.mhp.manifest.assetCatalog[itemKey].assets || {};
      this.mhp.manifest.assetCatalog[itemKey].assets.traits = this.mhp.manifest.assetCatalog[itemKey].assets.traits || [];
      this.mhp.manifest.assetCatalog[itemKey].assets.traits.push(traitKey);
    }
  }
  mapMasterEntryLink(itemKey,entryLink,IDResult){
    if(!entryLink.hasOwnProperty('MODIFIERS')) this.mapStats(entryLink,itemKey)
    else {
      let assetClass = this.ucFirst(IDResult[IDResult[entryLink.$.TARGETID]?.ID]?.$.TYPE || IDResult[IDResult[entryLink.$.TARGETID]?.ID]?.$.TYPENAME || IDResult[entryLink.$.TARGETID]?.$.TYPE || IDResult[entryLink.$.TARGETID]?.$.TYPENAME || entryLink.$.TYPE || entryLink.$.TYPENAME);
      let assetDesignation = this.ucFirst(entryLink.$.NAME);
      let assetKey = assetClass + '§' + assetDesignation;
    }
  }
  mapEntryLink(itemKey,entryLink,IDResult,depth){
    let traitClass = this.ucFirst(IDResult[IDResult[entryLink.$.TARGETID]?.ID]?.$.TYPE || IDResult[IDResult[entryLink.$.TARGETID]?.ID]?.$.TYPENAME || IDResult[entryLink.$.TARGETID]?.$.TYPE || IDResult[entryLink.$.TARGETID]?.$.TYPENAME || entryLink.$.TYPE || entryLink.$.TYPENAME);
    let traitDesignation = this.ucFirst(entryLink.$.NAME);
    let traitKey = traitClass + '§' + traitDesignation;
    this.mhp.manifest.assetTaxonomy[traitClass] = this.mhp.manifest.assetTaxonomy[traitClass] || {};
    this.mhp.manifest.assetCatalog[traitKey] = this.mhp.manifest.assetCatalog[traitKey] || {};
    this.mhp.manifest.assetCatalog[itemKey] = this.mhp.manifest.assetCatalog[itemKey] || {};
    this.mhp.manifest.assetCatalog[itemKey].assets = this.mhp.manifest.assetCatalog[itemKey].assets || {};
    this.mhp.manifest.assetCatalog[itemKey].assets.traits = this.mhp.manifest.assetCatalog[itemKey].assets.traits || [];
    this.mhp.manifest.assetCatalog[itemKey].assets.traits.push(traitKey)
  }
  mapForceEntries(itemKey,forceEntry){
    let forceClass = 'Force';
    let forceDesignation = this.ucFirst(forceEntry.$.NAME);
    let forceKey = forceClass + '§' + forceDesignation;
    this.mhp.manifest.assetTaxonomy[forceClass] = this.mhp.manifest.assetTaxonomy[forceClass] || {};
    this.mhp.manifest.assetCatalog[forceKey] = this.mhp.manifest.assetCatalog[forceKey] || {};
    forceEntry.FORCEENTRIES?.forEach(entries => {
      entries.FORCEENTRY.forEach(subForceEntry => {
        this.mapSubForceEntries(forceKey,subForceEntry);
      });
    });
  }
  mapSubForceEntries(forceKey,subForceEntry){
    let subForceClass = 'Force';
    let subForceDesignation = this.ucFirst(subForceEntry.$.NAME);
    let subForceKey = subForceClass + '§' + subForceDesignation;
    this.mhp.manifest.assetTaxonomy[subForceClass] = this.mhp.manifest.assetTaxonomy[subForceClass] || {};
    this.mhp.manifest.assetCatalog[subForceKey] = this.mhp.manifest.assetCatalog[subForceKey] || {};
  }
  mapSubProfile(itemKey,profile){
    profile.PROFILE.forEach((profile,i) => {
      let targetKey = itemKey
      if(profile.$.TYPENAME.toLowerCase() !== 'profile'){
        let subItemClass = profile.$.TYPENAME;
        this.mhp.manifest.assetTaxonomy[subItemClass] = this.mhp.manifest.assetTaxonomy[subItemClass] || {};
        targetKey = profile.$.TYPENAME + '§' + profile.$.NAME;
      }
      this.mhp.manifest.assetCatalog[targetKey] = this.mhp.manifest.assetCatalog[targetKey] || {};
      profile.CHARACTERISTICS?.forEach(char => {
        char.CHARACTERISTIC?.forEach(characteristic => {
          // console.log(itemKey,targetKey,profile,characteristic)
          if(characteristic._.length > 15) this.mhp.manifest.assetCatalog[targetKey].text = characteristic._;
          else this.mapStats(characteristic, targetKey);
        });
      });
      if(targetKey !== itemKey){
        this.mhp.manifest.assetCatalog[itemKey].assets = this.mhp.manifest.assetCatalog[itemKey].assets || {};
        this.mhp.manifest.assetCatalog[itemKey].assets.traits = this.mhp.manifest.assetCatalog[itemKey].assets.traits || [];
        this.mhp.manifest.assetCatalog[itemKey].assets.traits.push(targetKey);
      }
    });
  }
  mapSelection(selection, result, IDResult, depth: number, classOverride?: string){
    let itemClass = classOverride || this.ucFirst(selection.$.TYPE);
    let itemDesignation = this.ucFirst(selection.$.NAME);
    let itemKey = itemClass + '§' + itemDesignation;
    this.mhp.manifest.assetTaxonomy[itemClass] = this.mhp.manifest.assetTaxonomy[itemClass] || {};
    this.mhp.manifest.assetCatalog[itemKey] = this.mhp.manifest.assetCatalog[itemKey] || {};
    // console.log(itemKey,JSON.parse(JSON.stringify(this.mhp.manifest.assetCatalog[itemKey])))

    selection.CHARACTERISTICS?.forEach(char => {
      char.CHARACTERISTIC?.forEach(stat => {
        this.mapStats(stat, itemKey);
      });
    });
    // console.log(itemKey,JSON.parse(JSON.stringify(this.mhp.manifest.assetCatalog[itemKey])))
    selection.COSTS?.forEach(co => {
      co.COST?.forEach(stat => {
        this.mapStats(stat, itemKey, true);
      });
    });
    // console.log(itemKey,JSON.parse(JSON.stringify(this.mhp.manifest.assetCatalog[itemKey])))
    selection.INFOLINKS?.forEach(link => {
      // console.log(itemKey,link)
      link.INFOLINK.forEach(infoLink => {
        this.mapInfoLink(itemKey,infoLink,IDResult);
      });
    });
    // console.log(itemKey,JSON.parse(JSON.stringify(this.mhp.manifest.assetCatalog[itemKey])))
    selection.ENTRYLINKS?.forEach(link => {
      link.ENTRYLINK.forEach(entryLink => {
        this.mapEntryLink(itemKey,entryLink,IDResult,depth);
      });
    });
    // console.log(itemKey,JSON.parse(JSON.stringify(this.mhp.manifest.assetCatalog[itemKey])))
    selection.CATEGORYLINKS?.forEach(category => {
      this.mapKeywords(itemKey,category.CATEGORYLINK,IDResult);
    });
    // console.log(itemKey,JSON.parse(JSON.stringify(this.mhp.manifest.assetCatalog[itemKey])))
    selection.PROFILES?.forEach(profile => {
      // console.log(itemKey,profile)
      this.mapSubProfile(itemKey,profile);
    });
    // console.log(itemKey,JSON.parse(JSON.stringify(this.mhp.manifest.assetCatalog[itemKey])))
    selection.SELECTIONENTRIES?.forEach(element => {
      element.SELECTIONENTRY?.forEach(selection => {
        // console.log(itemKey,selection)
        let selectionTraitKey = this.mapSelection(selection,result,IDResult,depth ++);
        // console.log(itemKey,selectionTraitKey)
        this.mhp.manifest.assetCatalog[itemKey].assets = this.mhp.manifest.assetCatalog[itemKey].assets || {};
        this.mhp.manifest.assetCatalog[itemKey].assets.traits = this.mhp.manifest.assetCatalog[itemKey].assets.traits || [];
        this.mhp.manifest.assetCatalog[itemKey].assets.traits.push(selectionTraitKey);
      });
    });
    selection.SELECTIONENTRYGROUPS?.forEach(group => {
      group.SELECTIONENTRYGROUP?.forEach(entry => {
        console.log(itemKey,entry)
        this.mhp.manifest.assetCatalog[itemKey].stats[entry.$.NAME] = {
          statType: 'rank',
          ranks: {},
        }
        entry.ENTRYLINKS?.forEach(element => {
          if(element.ENTRYLINK.length > 1) this.mhp.manifest.assetCatalog[itemKey].stats[entry.$.NAME].ranks['-'] = {order:0};
          element.ENTRYLINK.forEach((link,i) => {
            this.mhp.manifest.assetCatalog[itemKey].stats[entry.$.NAME].ranks[link.$.NAME] = {order:i+1};
          });
        });
        entry.SELECTIONENTRIES?.forEach(element => {
          if(element.SELECTIONENTRY.length > 1) this.mhp.manifest.assetCatalog[itemKey].stats[entry.$.NAME].ranks['-'] = {order:0};
          element.SELECTIONENTRY.forEach((selection,i) => {
            this.mhp.manifest.assetCatalog[itemKey].stats[entry.$.NAME].ranks[selection.$.NAME] = {order:i+1};
          });
        });
      });
    });
    // console.log(itemKey,JSON.parse(JSON.stringify(this.mhp.manifest.assetCatalog[itemKey])))
    return itemKey
  }
  mapStats(stat: any, itemKey: string, cost: boolean = false){
    // if(itemKey.includes('⚔ Null rod'))  console.log('mapStats',itemKey,stat)
    let item = this.mhp.manifest.assetCatalog[itemKey];
    let classification = itemKey.split('§')[0] === 'Roster' ? item : this.mhp.manifest.assetTaxonomy[itemKey.split('§')[0]];
    if(['Description','Details','Abilities'].includes(stat.$.NAME)){
      if(stat._ !== '-') item.text = stat._;
    }else{
      let initValue = stat.hasOwnProperty('_') ? stat._ : stat.$?.VALUE;
      let value = !isNaN(Number(initValue)) ? Number(initValue) : initValue;
      classification.stats = classification.stats || {};
      classification.stats[stat.$.NAME] = classification.stats[stat.$.NAME] || {};
      classification.stats[stat.$.NAME].statType = [typeof classification.stats[stat.$.NAME].value, typeof value].every(thing => ['number','undefined'].includes(thing)) ? 'numeric' : 'term';
      classification.stats[stat.$.NAME].value = null;
      if(value !== null && classification.stats[stat.$.NAME].value != value){
        item.stats = item.stats || {};
        item.stats[stat.$.NAME] = item.stats[stat.$.NAME] || {};
        item.stats[stat.$.NAME].value = value;
      }
      if(cost){
        classification.stats[stat.$.NAME].statType = 'numeric';
        classification.stats[stat.$.NAME].tracked = true;
        classification.stats[stat.$.NAME].value = null;
      }
    }
  }
  mapKeywords(itemKey: string, categories, IDResult){
    let item = this.mhp.manifest.assetCatalog[itemKey];
    item.keywords = item.keywords || {};
    categories.forEach(category => {
      let keyarray = (IDResult[category.$.TARGETID]?.$.NAME || category.$.NAME).split(': ');
      let keyCat = keyarray.length === 1 ? 'Keywords' : keyarray[0];
      let keyword = keyarray.length === 1 ? keyarray[0] : keyarray[1];
      item.keywords[keyCat] = item.keywords[keyCat] || [];
      item.keywords[keyCat].push(keyword);
    });
  }
  findIDs(obj){
    let res = {}
    const recurse = (obj) => {
      for (const key in obj) {
        const value = obj[key]
        if(value.hasOwnProperty('ID')){
          res[value.ID] = obj;
        }
        if (value && typeof value === 'object') {
            recurse(value)
        }
      }
    }
    recurse(obj);
    return res
  }
  ucFirst(str:string){
    let compStr = (str || 'unclassified').replace(/\s+/g, ' ');
    return compStr.charAt(0).toUpperCase() + compStr.slice(1);
  }

  orderManifest(manifest: Manifest) {
    manifest.history.present = <ManifestHistoryItem>this.orderObject(manifest.history.present);
    ['assetCatalog', 'assetTaxonomy'].forEach(type => {
      manifest.history.present.manifest[type] = this.orderObject(manifest.history.present.manifest[type]);
      Object.keys(manifest.history.present.manifest[type]).forEach(typeName => {
        delete manifest.history.present.manifest[type][typeName].designation;
        delete manifest.history.present.manifest[type][typeName]['displayName'];
        manifest.history.present.manifest[type][typeName] = this.orderObject(manifest.history.present.manifest[type][typeName]);
        ['aspects','assets','allowed','stats','rules'].forEach(propertyName => {
          if (manifest.history.present.manifest[type][typeName][propertyName]) {
            if(['stats','rules'].includes(propertyName)){
              let log = false;
              manifest.history.present.manifest[type][typeName][propertyName] = this.orderObjectRecurse(manifest.history.present.manifest[type][typeName][propertyName],log);
            }else{
              manifest.history.present.manifest[type][typeName][propertyName] = this.orderObject(manifest.history.present.manifest[type][typeName][propertyName]);
            }
          }
          if (!Object.keys(manifest.history.present.manifest[type][typeName][propertyName] || {}).length) delete manifest.history.present.manifest[type][typeName][propertyName];
        });
      });
    });
  }
  orderObject(toOrder,log=false) {
    if(!Array.isArray(toOrder)){
      let orderKeys = Object.keys(toOrder || {}).sort((a,b) => a?.toLowerCase().localeCompare(b?.toLowerCase()))
      let ordered = orderKeys.reduce((obj, key) => {
          obj[key] = toOrder[key];
          return obj
        },
        {}
      );
      return ordered
    }
    return toOrder
  }
  orderObjectRecurse(toOrder,log=false){
    let ordered = this.orderObject(toOrder,log);
    for (var k in ordered){
      if(typeof ordered[k] == "object" && ordered[k] !== null) ordered[k] = this.orderObjectRecurse(ordered[k],log);
    }
    return ordered
  }
}
