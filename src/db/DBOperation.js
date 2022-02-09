/**
 * @author Administrator
 * Database operation class
 * App directly call to it and perform DB related Operation
 */

import DBInfo from './DBInfo';

export default class DBOperation extends DBInfo {

    openDB(isReadOnly, success, error) {
        //call to open SQLite DB
        this.openDatabase(isReadOnly)

        //check current version of db, as per create or upgrade it
        this.dbObj().transaction((tx) => {
            tx.executeSql('SELECT * FROM Version', [],
                (tx, results) => {
                    try {
                        var isNeedUpgrade = false;
                        if (results.rows.length > 0) {
                            let row = results.rows.item(0);
                            if (row.version_id != this.getCurrentDBVersion()) {
                                isNeedUpgrade = true
                            }
                        }

                        if (isNeedUpgrade) {
                            this.dbObj().transaction((rx) => this.upgradeDatabase(rx),
                                () => { return error() }, () => { return success() });
                        } else {
                            return success();
                        }
                    } catch (errors) {
                        return error();
                    }
                }, (errors) => {
                    this.dbObj().transaction((rx) => this.upgradeDatabase(rx),
                        () => {return error()}, () => { return success() });
                }
            );
        });
    }

    closeDB() {
        this.closeDatabase()
    }

}
