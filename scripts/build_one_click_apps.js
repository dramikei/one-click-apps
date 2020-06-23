 /*jshint esversion: 6 */
 const path = require('path');
 const fs = require('fs-extra')

 const PUBLIC = `public`
 const pathOfPublic = path.join(__dirname, '..', PUBLIC);


 function copyVersion(version) {

     const pathOfVersion = path.join(pathOfPublic, 'v' + version);
     const pathOfApps = path.join(pathOfVersion, 'apps');
     const pathOfList = path.join(pathOfVersion, 'autoGeneratedList.json'); //kept for backward compat
     const pathOfList2 = path.join(pathOfVersion, 'list');

     return fs.readdir(pathOfApps)
         .then(function (items) {

             const apps = items.filter(v => v.includes('.json'));
             const appDetails = [];

             for (var i = 0; i < apps.length; i++) {
                 const contentString = fs.readFileSync(path.join(pathOfApps, apps[i]));
                 const content = JSON.parse(contentString)
                 const captainVersion = (content.captainVersion + '');
                 const versionString = (version + '');
                 if (versionString !== captainVersion)
                     throw new Error(`unmatched versions   ${versionString}  ${captainVersion} for ${apps[i]}`)
                 if (captainVersion === "1") {
                     if (contentString.includes("$$cap_root_domain"))
                         throw new Error('V1 should not have root domain')
                 }

                 apps[i] = apps[i].replace('.json', '');

                 if (captainVersion + '' === '2') {
                     if (!content.displayName) {
                         content.displayName = apps[i]
                         content.displayName = content.displayName.substr(0, 1).toUpperCase() + content.displayName.substring(1, content.displayName.length)
                     }
                     if (!content.description) content.description = ''

                     appDetails[i] = {
                         name: apps[i],
                         displayName: content.displayName,
                         description: content.description,
                         logoUrl: apps[i] + '.png'
                     }
                 }

             }

             fs.outputJsonSync(pathOfList, {
                 appList: apps,
                 appDetails: appDetails
             });

             fs.outputJsonSync(pathOfList2, {
                 oneClickApps: appDetails
             });

         })
 }


 Promise.resolve()
     .then(function () {
         return copyVersion(1)
     })
     .then(function () {
         return copyVersion(2)
     })
     .catch(function (err) {
         console.error(err)
         process.exit(127)
     })