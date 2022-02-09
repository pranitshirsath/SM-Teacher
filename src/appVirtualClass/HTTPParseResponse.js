
import DBOperation from '../db/DBOperation';
import AsyncStorage from '@react-native-community/async-storage';
import Moment from 'moment';

export default class HTTPParseResponse {

    constructor(method, classObject) {
        this.method = method;
        this.classObject = classObject;
    }

    parseResponse(respData) {
        if (this.method == 'GetHolidayList') {
            this.onHolidaysDetailsList(respData);
        }
    }

    onHolidaysDetailsList(respData) {
        try {
            const respJSON = respData[0];
              const status = jsonRec['Message'];
                                    
            if (status == 'Success') {
                const lstHolidayList = respJSON['Data'];                                
                if (lstHolidayList.length > 0) {
                    const database = new DBOperation();
                    database.openDB(false, () => {
                        database.dbObj().transaction((databaseTX) => {

                            try {
                                //truncate all holiday list
                                databaseTX.executeSql('DELETE FROM HolidayList_tbl');

                                lstHolidayList.forEach(singleObj => {
                                    const startDate = Moment(singleObj['StartDate'],'DD/MM/YYYY').valueOf();
                                    let endDate = singleObj['EndDate'];
                                    if (endDate == '') endDate = startDate;
                                    else endDate = Moment(endDate,'DD/MM/YYYY').valueOf();

                                    let insertRec = [];
                                    insertRec.push(singleObj['Remark']);  // remark(HolidayName)
                                    insertRec.push(startDate); insertRec.push(endDate);
                                    databaseTX.executeSql('INSERT INTO HolidayList_tbl VALUES(?,?,?) ', insertRec);
                                });
                            } catch (error) { console.error(error); }

                        }, database.dbObj().error, () => {
                            //on transaction end
                            database.closeDatabase();

                            AsyncStorage.setItem('lastTimeHolidayListSync', String(new Date().valueOf()));
                            this.classObject.onHTTPResponseHolidayList(respData);
                        });
                    }, () => {
                        //on error occur
                        database.closeDatabase()
                    });
                } else {
                    this.classObject.changeLoadingStatus(false);
                }
            } else {
                this.classObject.changeLoadingStatus(false);                
            }
        } catch (error) {
            this.classObject.changeLoadingStatus(false);
            console.error(error);
        }
    }
}