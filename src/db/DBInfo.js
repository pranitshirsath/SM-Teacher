/**
 * @author Administrator
 * Database All Tables information
 * like its table name, column name, types, etc
 * @flow
 */
import {
    database_DEBUG, database_name, database_version,    
} from '../config/AppConst';

let databaseObj;

//database
import SQLite from 'react-native-sqlite-storage';
SQLite.DEBUG(database_DEBUG);
SQLite.enablePromise(false);

const version_create = 'CREATE TABLE IF NOT EXISTS Version( '
    + 'version_id INTEGER);';
const version_drop = 'DROP TABLE IF EXISTS Version;';

//Holiday List table
const holidayList_create = 'CREATE TABLE IF NOT EXISTS HolidayList_tbl ( '
    + '  HolidayName TEXT, StartDateLong TEXT, EndDateLong TEXT '
    + ');';
const holidayList_drop = 'DROP TABLE IF EXISTS HolidayList_tbl;';


export default class DBInfo {

    //create all new table in database
    createDatabase(databaseTX) {
        databaseTX.executeSql(version_create);
        databaseTX.executeSql(holidayList_create);
       
        //insert current version of DB
        databaseTX.executeSql("INSERT INTO Version VALUES (" + database_version + ");")
    }

    //update database, drop current tables and create new
    upgradeDatabase(databaseTX) {
        databaseTX.executeSql(version_drop);
        databaseTX.executeSql(holidayList_drop);
                
        //create all tables
        this.createDatabase(databaseTX)
    }

    //Open SQLITE database
    openDatabase(readOnly) {
        databaseObj = SQLite.openDatabase({ name: database_name,
            location: 'default', readOnly: readOnly},
            this.openCB, this.errorCB);
    }

    //close SQLITE Database
    closeDatabase() {
        if (databaseObj) {
            try {
                databaseObj.abortAllPendingTransactions()
            } catch (error) {}

            //close connection
            databaseObj.close(this.closeCB, this.errorCB);            
        }
    }

    //get current open database object
    dbObj() {
        if (databaseObj) {
            return databaseObj;
        } else {
            return null;
        }
    }

    getCurrentDBVersion() {
        return database_version;
    }

    errorCB = (err) => {
        console.log("error: ", err);
        return false;
    }
    successCB = () => {
        console.log("SQL executed ...");
    }
    openCB = () => {
        console.log("Database OPEN");
    }
    closeCB = () => {
        console.log("Database CLOSED");
    }

}