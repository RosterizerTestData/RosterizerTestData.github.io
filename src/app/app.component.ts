import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Rulebook, RulebookHistoryItem } from 'src/models/rulebook.model';
import { Asset, Item } from 'src/models/object.model';
import * as xml2js from 'xml2js';
import * as JSZip from 'jszip';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements AfterViewInit {
  title = 'battlescribe-to-rosterizer';
  urlField: FormControl = new FormControl(``);
  parser;
  mhps: RulebookHistoryItem[] = [];

  constructor() {
    this.parser = new xml2js.Parser({ strict: false, trim: true });
    this.onTranslate = this.onTranslate.bind(this);
  }
  ngAfterViewInit(): void {
    let textarea = document.getElementsByTagName('textarea')[0];
    if (textarea) {
      console.log(textarea)
      textarea.addEventListener('input', () => {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
      });

      // Initialize the textarea height
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }
  
  async onTranslate(){
    this.mhps = [];
    let urls = this.urlField.value.split('\n');
    // remove anything that doesn't look like a url
    const urlPattern = /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,})(\/\S*)?$/i;
    urls = urls.filter(url => urlPattern.test(url));
    console.log(urls)
    urls.forEach(url => {
      fetch('https://api.codetabs.com/v1/proxy?quest=' + url).then((res) => res.text()).then((body) => {
        this.parser.parseString(body, (err, result) => {
          let IDResult = this.findIDs(result);
          this.mhps.push(new RulebookHistoryItem);
          let i = this.mhps.length - 1;
          delete this.mhps[i].id;
          delete this.mhps[i].note;
          delete this.mhps[i].updatedObject;
          delete this.mhps[i].updated_at;
          delete this.mhps[i].source;
          // get game name from url as substring between 'BSData/' and '/master'
          this.mhps[i].game = url.substring(url.indexOf('BSData/') + 7, url.indexOf('/master'));
          console.log(JSON.parse(JSON.stringify(this.mhps[i])))
          this.mhps[i].notes = 'This data was translated automatically from a battlescribe catalog. Only asset names and bare stats have been translated and considerable editing is required in order for it to become useful in Rosterizer.';
          console.log(url,body,result);
          console.log(IDResult);
          ['CATALOGUE','GAMESYSTEM'].forEach(topLevel => {
            Object.keys(result[topLevel] || {})?.forEach(subCat => {
              let subCats = result[topLevel][subCat];
              if(!Array.isArray(subCats)){
                this.mhps[i].name = subCats.NAME;
              }else{
                switch (subCat) {
                  case 'FORCEENTRIES':
                    subCats.forEach(element => {
                      element.FORCEENTRY?.forEach(forceEntry => {
                        this.mapForceEntries(i,'Roster§Roster',forceEntry);
                      });
                    });
                    break;
                  case 'CATEGORYLINKS':
                    if(topLevel === 'GAMESYSTEM'){
                      subCats.forEach(element => {
                        element.ENTRYLINK?.forEach(entryLink => {
                          this.mapMasterEntryLink(i,'Roster§Roster',entryLink,IDResult);
                        });
                      });
                    }
                    break;
                  case 'ENTRYLINKS':
                    if(topLevel === 'GAMESYSTEM'){
                      subCats.forEach(element => {
                        element.ENTRYLINK?.forEach(entryLink => {
                          this.mapMasterEntryLink(i,'Roster§Roster',entryLink,IDResult);
                        });
                      });
                    }
                    break;
                  case 'SHAREDPROFILES':
                    subCats.forEach(element => {
                      element.PROFILE?.forEach(profile => {
                        this.mapProfile(i,profile);
                      });
                    });
                    break;
                  case 'SHAREDRULES':
                    subCats.forEach(element => {
                      element.RULE?.forEach(rule => {
                        this.mapRule(i,rule);
                      });
                    });
                    break;
                  case 'SELECTIONENTRIES':
                    subCats.forEach(element => {
                      element.SELECTIONENTRY?.forEach(selection => {
                        console.log(subCat,selection)
                        this.mapSelection(i,selection,result,IDResult,1);
                      });
                    });
                    break;
                  case 'SHAREDSELECTIONENTRIES':
                    subCats.forEach(element => {
                      element.SELECTIONENTRY?.forEach(selection => {
                        console.log(subCat,selection)
                        this.mapSelection(i,selection,result,IDResult,1);
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
                            this.mapSelection(i,selection,result,IDResult,1,classOverride);
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
          this.orderRulebookHistory(this.mhps[i]);
          // console.log(this.mhp)
        });
      });
    });
  }
  onClip(i){
    window.navigator['clipboard'].writeText(JSON.stringify(this.mhps[i], null, 4));
  }
  mapProfile(i,profile){
    let itemClass = this.ucFirst(profile.$.TYPENAME);
    let itemDesignation = this.ucFirst(profile.$.NAME);
    let itemKey = itemClass + '§' + itemDesignation;
    this.mhps[i].rulebook.assetTaxonomy[itemClass] = this.mhps[i].rulebook.assetTaxonomy[itemClass] || {};
    this.mhps[i].rulebook.assetCatalog[itemKey] = this.mhps[i].rulebook.assetCatalog[itemKey] || {};
    profile.CHARACTERISTICS?.forEach(char => {
      char.CHARACTERISTIC?.forEach(stat => {
        this.mapStats(i, stat,itemKey);
      });
    });
  }
  mapRule(i,rule){
    let itemClass = 'Rule';
    let itemDesignation = this.ucFirst(rule.$.NAME);
    let itemKey = itemClass + '§' + itemDesignation;
    this.mhps[i].rulebook.assetTaxonomy[itemClass] = this.mhps[i].rulebook.assetTaxonomy[itemClass] || {};
    this.mhps[i].rulebook.assetCatalog[itemKey] = this.mhps[i].rulebook.assetCatalog[itemKey] || {};
    this.mhps[i].rulebook.assetCatalog[itemKey].text = rule.DESCRIPTION?.join('\n\n');
  }
  mapInfoLink(i,itemKey,infoLink,IDResult){
    let traitClass = this.ucFirst(IDResult[IDResult[infoLink.$.TARGETID]?.ID]?.$.TYPE || IDResult[IDResult[infoLink.$.TARGETID]?.ID]?.$.TYPENAME || IDResult[infoLink.$.TARGETID]?.$.TYPE || IDResult[infoLink.$.TARGETID]?.$.TYPENAME || infoLink.$.TYPE || infoLink.$.TYPENAME);
    let traitDesignation = this.ucFirst(infoLink.$.NAME);
    let traitKey = traitClass + '§' + traitDesignation;
    // console.log(itemKey,traitKey,infoLink,IDResult)
    if(infoLink.$.TYPE === 'profile'){
      let profile = IDResult[infoLink.$.TARGETID];
      // console.log(profile)
      profile?.CHARACTERISTICS?.forEach(element => {
        element.CHARACTERISTIC?.forEach(stat => {
          this.mapStats(i, stat, itemKey);
        });
      });
    }else{
      this.mhps[i].rulebook.assetTaxonomy[traitClass] = this.mhps[i].rulebook.assetTaxonomy[traitClass] || {};
      this.mhps[i].rulebook.assetCatalog[traitKey] = this.mhps[i].rulebook.assetCatalog[traitKey] || {};
      this.mhps[i].rulebook.assetCatalog[itemKey] = this.mhps[i].rulebook.assetCatalog[itemKey] || {};
      this.mhps[i].rulebook.assetCatalog[itemKey].assets = this.mhps[i].rulebook.assetCatalog[itemKey].assets || {};
      this.mhps[i].rulebook.assetCatalog[itemKey].assets.traits = this.mhps[i].rulebook.assetCatalog[itemKey].assets.traits || [];
      this.mhps[i].rulebook.assetCatalog[itemKey].assets.traits.push(traitKey);
    }
  }
  mapMasterEntryLink(i,itemKey,entryLink,IDResult){
    if(!entryLink.hasOwnProperty('MODIFIERS')) this.mapStats(i,entryLink,itemKey)
    else {
      let assetClass = this.ucFirst(IDResult[IDResult[entryLink.$.TARGETID]?.ID]?.$.TYPE || IDResult[IDResult[entryLink.$.TARGETID]?.ID]?.$.TYPENAME || IDResult[entryLink.$.TARGETID]?.$.TYPE || IDResult[entryLink.$.TARGETID]?.$.TYPENAME || entryLink.$.TYPE || entryLink.$.TYPENAME);
      let assetDesignation = this.ucFirst(entryLink.$.NAME);
      let assetKey = assetClass + '§' + assetDesignation;
    }
  }
  mapEntryLink(i,itemKey,entryLink,IDResult,depth){
    let traitClass = this.ucFirst(IDResult[IDResult[entryLink.$.TARGETID]?.ID]?.$.TYPE || IDResult[IDResult[entryLink.$.TARGETID]?.ID]?.$.TYPENAME || IDResult[entryLink.$.TARGETID]?.$.TYPE || IDResult[entryLink.$.TARGETID]?.$.TYPENAME || entryLink.$.TYPE || entryLink.$.TYPENAME);
    let traitDesignation = this.ucFirst(entryLink.$.NAME);
    let traitKey = traitClass + '§' + traitDesignation;
    this.mhps[i].rulebook.assetTaxonomy[traitClass] = this.mhps[i].rulebook.assetTaxonomy[traitClass] || {};
    this.mhps[i].rulebook.assetCatalog[traitKey] = this.mhps[i].rulebook.assetCatalog[traitKey] || {};
    this.mhps[i].rulebook.assetCatalog[itemKey] = this.mhps[i].rulebook.assetCatalog[itemKey] || {};
    this.mhps[i].rulebook.assetCatalog[itemKey].assets = this.mhps[i].rulebook.assetCatalog[itemKey].assets || {};
    this.mhps[i].rulebook.assetCatalog[itemKey].assets.traits = this.mhps[i].rulebook.assetCatalog[itemKey].assets.traits || [];
    this.mhps[i].rulebook.assetCatalog[itemKey].assets.traits.push(traitKey)
  }
  mapForceEntries(i,itemKey,forceEntry){
    let forceClass = 'Force';
    let forceDesignation = this.ucFirst(forceEntry.$.NAME);
    let forceKey = forceClass + '§' + forceDesignation;
    this.mhps[i].rulebook.assetTaxonomy[forceClass] = this.mhps[i].rulebook.assetTaxonomy[forceClass] || {};
    this.mhps[i].rulebook.assetCatalog[forceKey] = this.mhps[i].rulebook.assetCatalog[forceKey] || {};
    forceEntry.FORCEENTRIES?.forEach(entries => {
      entries.FORCEENTRY.forEach(subForceEntry => {
        this.mapSubForceEntries(i,forceKey,subForceEntry);
      });
    });
  }
  mapSubForceEntries(i,forceKey,subForceEntry){
    let subForceClass = 'Force';
    let subForceDesignation = this.ucFirst(subForceEntry.$.NAME);
    let subForceKey = subForceClass + '§' + subForceDesignation;
    this.mhps[i].rulebook.assetTaxonomy[subForceClass] = this.mhps[i].rulebook.assetTaxonomy[subForceClass] || {};
    this.mhps[i].rulebook.assetCatalog[subForceKey] = this.mhps[i].rulebook.assetCatalog[subForceKey] || {};
  }
  mapSubProfile(i,itemKey,profile){
    profile.PROFILE.forEach(profile => {
      let targetKey = itemKey
      if(profile.$.TYPENAME.toLowerCase() !== 'profile'){
        let subItemClass = profile.$.TYPENAME;
        this.mhps[i].rulebook.assetTaxonomy[subItemClass] = this.mhps[i].rulebook.assetTaxonomy[subItemClass] || {};
        targetKey = profile.$.TYPENAME + '§' + profile.$.NAME;
      }
      this.mhps[i].rulebook.assetCatalog[targetKey] = this.mhps[i].rulebook.assetCatalog[targetKey] || {};
      profile.CHARACTERISTICS?.forEach(char => {
        char.CHARACTERISTIC?.forEach(characteristic => {
          // console.log(itemKey,targetKey,profile,characteristic)
          if(characteristic._?.length > 15) this.mhps[i].rulebook.assetCatalog[targetKey].text = characteristic._;
          else this.mapStats(i,characteristic, targetKey);
        });
      });
      if(targetKey !== itemKey){
        this.mhps[i].rulebook.assetCatalog[itemKey].assets = this.mhps[i].rulebook.assetCatalog[itemKey].assets || {};
        this.mhps[i].rulebook.assetCatalog[itemKey].assets.traits = this.mhps[i].rulebook.assetCatalog[itemKey].assets.traits || [];
        this.mhps[i].rulebook.assetCatalog[itemKey].assets.traits.push(targetKey);
      }
    });
  }
  mapSelection(i, selection, result, IDResult, depth: number, classOverride?: string){
    let itemClass = classOverride || this.ucFirst(selection.$.TYPE);
    let itemDesignation = this.ucFirst(selection.$.NAME);
    let itemKey = itemClass + '§' + itemDesignation;
    this.mhps[i].rulebook.assetTaxonomy[itemClass] = this.mhps[i].rulebook.assetTaxonomy[itemClass] || {};
    this.mhps[i].rulebook.assetCatalog[itemKey] = this.mhps[i].rulebook.assetCatalog[itemKey] || {};
    // console.log(itemKey,JSON.parse(JSON.stringify(this.mhps[i].rulebook.assetCatalog[itemKey])))

    selection.CHARACTERISTICS?.forEach(char => {
      char.CHARACTERISTIC?.forEach(stat => {
        this.mapStats(i, stat, itemKey);
      });
    });
    // console.log(itemKey,JSON.parse(JSON.stringify(this.mhps[i].rulebook.assetCatalog[itemKey])))
    selection.COSTS?.forEach(co => {
      co.COST?.forEach(stat => {
        this.mapStats(i, stat, itemKey, true);
      });
    });
    // console.log(itemKey,JSON.parse(JSON.stringify(this.mhps[i].rulebook.assetCatalog[itemKey])))
    selection.INFOLINKS?.forEach(link => {
      // console.log(itemKey,link)
      link.INFOLINK.forEach(infoLink => {
        this.mapInfoLink(i,itemKey,infoLink,IDResult);
      });
    });
    // console.log(itemKey,JSON.parse(JSON.stringify(this.mhps[i].rulebook.assetCatalog[itemKey])))
    selection.ENTRYLINKS?.forEach(link => {
      link.ENTRYLINK.forEach(entryLink => {
        this.mapEntryLink(i,itemKey,entryLink,IDResult,depth);
      });
    });
    // console.log(itemKey,JSON.parse(JSON.stringify(this.mhps[i].rulebook.assetCatalog[itemKey])))
    selection.CATEGORYLINKS?.forEach(category => {
      this.mapKeywords(i,itemKey,category.CATEGORYLINK,IDResult);
    });
    // console.log(itemKey,JSON.parse(JSON.stringify(this.mhps[i].rulebook.assetCatalog[itemKey])))
    selection.PROFILES?.forEach(profile => {
      // console.log(itemKey,profile)
      this.mapSubProfile(i,itemKey,profile);
    });
    // console.log(itemKey,JSON.parse(JSON.stringify(this.mhps[i].rulebook.assetCatalog[itemKey])))
    selection.SELECTIONENTRIES?.forEach(element => {
      element.SELECTIONENTRY?.forEach(selection => {
        // console.log(itemKey,selection)
        let selectionTraitKey = this.mapSelection(i,selection,result,IDResult,depth ++);
        // console.log(itemKey,selectionTraitKey)
        this.mhps[i].rulebook.assetCatalog[itemKey].assets = this.mhps[i].rulebook.assetCatalog[itemKey].assets || {};
        this.mhps[i].rulebook.assetCatalog[itemKey].assets.traits = this.mhps[i].rulebook.assetCatalog[itemKey].assets.traits || [];
        this.mhps[i].rulebook.assetCatalog[itemKey].assets.traits.push(selectionTraitKey);
      });
    });
    selection.SELECTIONENTRYGROUPS?.forEach(group => {
      this.mhps[i].rulebook.assetCatalog[itemKey].stats = this.mhps[i].rulebook.assetCatalog[itemKey].stats || {};
      group.SELECTIONENTRYGROUP?.forEach(entry => {
        console.log(itemKey,entry)
        this.mhps[i].rulebook.assetCatalog[itemKey].stats[entry.$.NAME] = {
          statType: 'rank',
          ranks: {},
        }
        entry.ENTRYLINKS?.forEach(element => {
          if(element.ENTRYLINK.length > 1) this.mhps[i].rulebook.assetCatalog[itemKey].stats[entry.$.NAME].ranks['-'] = {order:0};
          element.ENTRYLINK.forEach((link,j) => {
            this.mhps[i].rulebook.assetCatalog[itemKey].stats[entry.$.NAME].ranks[link.$.NAME] = {order:j+1};
          });
        });
        entry.SELECTIONENTRIES?.forEach(element => {
          if(element.SELECTIONENTRY.length > 1) this.mhps[i].rulebook.assetCatalog[itemKey].stats[entry.$.NAME].ranks['-'] = {order:0};
          element.SELECTIONENTRY.forEach((selection,j) => {
            this.mhps[i].rulebook.assetCatalog[itemKey].stats[entry.$.NAME].ranks[selection.$.NAME] = {order:j+1};
          });
        });
      });
    });
    // console.log(itemKey,JSON.parse(JSON.stringify(this.mhps[i].rulebook.assetCatalog[itemKey])))
    return itemKey
  }
  mapStats(i, stat: any, itemKey: string, cost: boolean = false){
    // if(itemKey.includes('⚔ Null rod'))  console.log('mapStats',itemKey,stat)
    let item = this.mhps[i].rulebook.assetCatalog[itemKey];
    let classification = itemKey.split('§')[0] === 'Roster' ? item : this.mhps[i].rulebook.assetTaxonomy[itemKey.split('§')[0]];
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
  mapKeywords(i, itemKey: string, categories, IDResult){
    let item = this.mhps[i].rulebook.assetCatalog[itemKey];
    item.keywords = item.keywords || {};
    categories.forEach(category => {
      let keyarray = (IDResult[category.$.TARGETID]?.$.NAME || category.$.NAME)?.split(': ') || [];
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

  orderRulebookHistory(rulebookHistory: RulebookHistoryItem) {
    rulebookHistory = <RulebookHistoryItem>this.orderObject(rulebookHistory);
    ['assetCatalog', 'assetTaxonomy'].forEach(type => {
      rulebookHistory.rulebook[type] = this.orderObject(rulebookHistory.rulebook[type]);
      Object.keys(rulebookHistory.rulebook[type]).forEach(typeName => {
        delete rulebookHistory.rulebook[type][typeName].designation;
        delete rulebookHistory.rulebook[type][typeName]['displayName'];
        rulebookHistory.rulebook[type][typeName] = this.orderObject(rulebookHistory.rulebook[type][typeName]);
        ['aspects','assets','allowed','stats','rules'].forEach(propertyName => {
          if (rulebookHistory.rulebook[type][typeName][propertyName]) {
            if(['stats','rules'].includes(propertyName)){
              let log = false;
              rulebookHistory.rulebook[type][typeName][propertyName] = this.orderObjectRecurse(rulebookHistory.rulebook[type][typeName][propertyName],log);
            }else{
              rulebookHistory.rulebook[type][typeName][propertyName] = this.orderObject(rulebookHistory.rulebook[type][typeName][propertyName]);
            }
          }
          if (!Object.keys(rulebookHistory.rulebook[type][typeName][propertyName] || {}).length) delete rulebookHistory.rulebook[type][typeName][propertyName];
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

  exportAllCSVs(event: Event){
    var zip = new JSZip();
    let game = this.mhps[0].game;
    this.mhps.forEach((mhp,i) => {
      if(mhp){
        let zipCat = this.exportCSVs(i,false);
        zipCat.forEach((filename,zipfile) => {
          console.log(filename,zipfile)
          zip.folder(mhp.name).file(filename, zipfile.async('blob'));
        });
      }
    });
    zip.generateAsync({type:'blob'}).then(function(content) {
      saveAs(content, game + '.zip');
    });
  }
  exportCSVs(i,dl: boolean = true) {
    const classNames = Object.keys(this.mhps[i].rulebook.assetTaxonomy);
    let csvStrings:{[className: string]: string} = {};
    classNames.forEach(className => {
      let itemList = Object.entries(this.mhps[i].rulebook.assetCatalog).filter(([itemKey,item]) => itemKey.split('§')[0] === className);
      const verboten = ['designation','classification','id','templateClass','rules','aspects','tracked','tally'];
      const kosher = ['stats','keywords','allowed','constraints','disallowed','assets','text','info'];
      let itemFields = [['designation']];
      let classCompare = this.mhps[i].rulebook.assetTaxonomy[className];
      kosher.forEach(key => {
        switch (key) {
          case 'stats':
            let newStatList = {}
            while(Object.keys(classCompare.stats || {}).length){
              let statName = Object.keys(classCompare.stats)[0];
              let stat = classCompare.stats[statName];
              let statGroupOrder = stat.groupOrder || 1;
              let statOrder = stat.statOrder || 1;
              newStatList[statGroupOrder] = newStatList[statGroupOrder] || {};
              newStatList[statGroupOrder][statOrder] = newStatList[statGroupOrder][statOrder] || {};
              newStatList[statGroupOrder][statOrder][statName] = stat;
              delete classCompare.stats[statName];
            }
            let statGroupOrders = Object.keys(newStatList).map(groupOrder => parseInt(groupOrder)).sort((a,b) => a - b);
            statGroupOrders.forEach(groupOrder => {
              let statOrders = Object.keys(newStatList[groupOrder]).map(statOrder => parseInt(statOrder)).sort((a,b) => a - b);
              statOrders.forEach(statOrder => {
                Object.keys(newStatList[groupOrder][statOrder]).sort((a,b) => a.localeCompare(b)).forEach(statName => {
                  itemFields.push([key,statName]);
                })
              });
            });
            break;
          case 'info':
            if(Object.keys(classCompare).includes(key)){
              Object.keys(classCompare[key]).forEach(keyCat => {
                itemFields.push([key,keyCat]);
              })
            }
            break;
          case 'keywords':
            if(Object.keys(classCompare).includes(key)){
              Object.keys(classCompare[key]).forEach(keyCat => {
                itemFields.push([key,keyCat]);
              })
            }else{
              itemFields.push([key,'Keywords'],[key,'Tags']);
            }
            break;
          case 'assets':
            itemFields.push(...[['assets','traits'],['assets','included']]);
            break;
          case 'allowed':
            itemFields.push(...[['allowed','classifications'],['allowed','items']]);
            break;
          case 'constraints':
            itemFields.push(...[['constraints','any'],['constraints','all'],['constraints','none'],['constraints','not']]);
            break;
          case 'disallowed':
            itemFields.push(...[['disallowed','classifications'],['disallowed','items']]);
            break;
          case 'text':
            itemFields.push(['text']);
            break;
          default:
            break;
        }
      });
      let csvString = itemFields.map(item => item.join('§')).join(',') + '\r\n';
      itemList.forEach(([itemKey,item],j) => {
        item['designation'] = itemKey.split('§')[1];
        let itemLine: string[] = [];
        itemFields.forEach(itemField => {
          let obj: any = item;
          itemField.forEach(fieldNode => {
            obj = obj?.[fieldNode] || null;
          });
          if(typeof obj === 'string'){
            itemLine.push(this.formatCSVEntry(obj));
          }else if(Array.isArray(obj)){
            if(['assets','allowed','constraints','disallowed'].includes(itemField[0])){
              let toFormat = obj.map(objEl => {
                if(typeof objEl === 'object') return JSON.stringify(objEl)
                else return objEl
              })
              itemLine.push(this.formatCSVEntry(toFormat.join('§§')));
            }
            else itemLine.push(this.formatCSVEntry(obj.join('§')));
          }else if(itemField[0] === 'stats'){
            let statName = itemField[1];
            let statToPush = (obj?.value || obj?.value === 0) ? obj?.value : null;
            if(statToPush === null) itemLine.push('§');
            else if(typeof statToPush === 'undefined') itemLine.push('');
            else itemLine.push(this.formatCSVEntry(statToPush));
          }else itemLine.push('');
        });
        csvString += itemLine.join(',');
        csvString += (j + 1) < Object.keys(itemList).length ? '\r\n' : '';
      });
      csvStrings[className] = csvString;
    });
    let filename = '';
    filename += (this.mhps[i].game + '_') || '';
    filename += (this.mhps[i].name) || '';
    var zip = new JSZip();
    Object.entries(csvStrings).forEach(([className,csvString]) => {
      zip.file(filename + '_' + className + '_assets.csv', csvString);
    });
    if(dl){
      zip.generateAsync({type:'blob'}).then(function(content) {
        saveAs(content, filename + '.zip');
      });
      return null;
    }else{
      return zip;
    }
  }
  formatCSVEntry(value){
    let formattedValue = value;
    if(typeof formattedValue === 'number') formattedValue = formattedValue.toString();
    if(formattedValue?.includes(',') || formattedValue?.includes('"')) formattedValue = `"${formattedValue.replace(/"/g,'""')}"`;
    return formattedValue.replace(/(\r\n|\r|\n)/g,'\\n')
  }
}
