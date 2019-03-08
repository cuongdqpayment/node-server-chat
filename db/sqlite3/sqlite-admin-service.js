
"use strict"

const NodeRSA = require('node-rsa');

const utils = require('../../utils/array-object');
const config = require('./sqlite-config');
const isSilence = config.keep_silence;

const db_service = require('./excel-sqlite-service');
var db;

const dbFilename = './db/'+config.database_name;
const excelFilename = './db/sqlite3/admin-setting.xlsx';

//Khoi tao database
setTimeout(() => {
    //ket noi db moi neu khac default trong excel-sqlite-service
    db_service.handler.init(dbFilename); 
    //lay db
    db = db_service.handler.db();

}, 1000); //doi 1s ket noi db


const serverKey = new NodeRSA(null, { signingScheme: 'pkcs1-sha256' });
var RSAKeyRow;

class HandleDatabaseService {

    init(){
        // Khoi tao cac bang du lieu tu excel
        //chi chay 1 lan ban dau de tao csdl thoi
        //db_service.handler.createDatabase(excelFilename,dbFilename); 
    }

    db(){
        return db;
    }

    //neu chua co thi khoi tao
    getServiceKey(service_id){
        if (RSAKeyRow){
            console.log('RSAKeyRow', RSAKeyRow);
            
            return (new Promise((resolve, reject) => {
                try{
                  serverKey.importKey(RSAKeyRow.private_key);
                }catch(err){
                  reject(err); //bao loi khong import key duoc
                } 
                resolve(serverKey);
            }));
        }else{
            console.log('createServiceKey');
            
            return this.createServiceKey(service_id)
            .then(data=>{
                RSAKeyRow = data;
                console.log('RSAKeyRow 2:',RSAKeyRow);
                if (RSAKeyRow){
                    try{
                        serverKey.importKey(RSAKeyRow.private_key);
                      }catch(err){
                        throw err; //bao loi khong import key duoc
                      } 
                }else{
                    throw 'No RSAKeyRow'
                }
            })
        }
    }

    //getKey de su dung dich vu
    createServiceKey(service_id){
        
        console.log('BAT DAU TAO KEY: ');
        var serviceKeyId = (service_id)?service_id:config.service_key;
        //doi thoi gian de no tao bang csdl truoc khi tao du lieu
        
        return db.getRst("select service_id\
                                ,private_key\
                                ,public_key\
                                ,service_name\
                                ,is_active\
                                from server_keys\
                                where service_id='"+serviceKeyId+"'")
        .then(row=>{

            //console.log('Key Row: ', row);
            if (row){
                console.log('Key row: ', row);
                return row;
            }else{
                
                let key = new NodeRSA({ b: 512 }, { signingScheme: 'pkcs1-sha256' });
                console.log('KHONG CO TRONG CSDL NEN BAT DAU TAO:');
                let insertTable={ name:'server_keys',
                cols:[
                        {
                        name:'service_id',
                        value: serviceKeyId
                        },
                        {
                        name:'private_key',
                        value: key.exportKey('private')
                        },
                        {
                        name:'public_key',
                        value: key.exportKey('public')
                        },
                        {
                        name:'service_name',
                        value: 'Khóa của dịch vụ api'
                        }
                    ]
                };
                return db.insert(insertTable).then(data=>{
                    if (!isSilence) console.log(data);
                        let keyCreated = {  service_id: serviceKeyId,
                                            private_key: key.exportKey('private'),
                                            public_key: key.exportKey('public'),
                                            service_name: 'Khóa của dịch vụ web c3',
                                            is_active: 1 };
                        //tao admin user trong sqlite thoi 
                        console.log('createAdminUser');
                        this.createAdminUser(keyCreated)
                        return keyCreated;
                        
                });
            }
        })
        .catch(err=>{
            console.log('KEY KHONG THE TAO', err);
            throw err;
        })
    }

    //dua key object vao
    createAdminUser(keyObject){
        if (keyObject&&keyObject.private_key&&keyObject.public_key){
            if (!isSilence) console.log(keyObject.public_key);
            let username='ADMIN';
            let password='Cng@3500888';
            let decryptedPassSign='';
            var MidlewareRSA = new NodeRSA(null, { signingScheme: 'pkcs1-sha256' });
            MidlewareRSA.importKey(keyObject.private_key);
            try {
                decryptedPassSign = MidlewareRSA.sign(JSON.stringify({
                  username: username,
                  password: password
                }), 'base64');
                let userInfo = {
                    username: username
                    ,password: decryptedPassSign
                    ,role: 99 //vai tro cua quan tri he thong
                    ,nickname: 'Quản trị hệ thống'
                    ,fullname: 'Đoàn Quốc Cường'
                    ,image: 'https://lavaprotocols.com/wp-content/uploads/2014/09/google-apps-admin-panel-icon.png'
                    ,phone: '903500888'
                    ,email: 'cuongdq350088@gmail.com'
                    ,address: 'Admin đây mà'
                  }

                this.createUser(userInfo)
                .then(data=>{
                    if (!isSilence) {
                        console.log('------>TAO ADMIN: ' + data);
                        console.log(userInfo);
                    }
                    
                })
                .catch(err=>{
                    console.log(err);
                })
                ;
    
              } catch (err) {
                console.log(err);
              }

        }else{
            console.log('NO server Key for create admin User');
        }

    }

    createUser(userInfo){

    var userInfoSQL = utils.convertSqlFromJson('admin_users',userInfo,['username']);
    
        return db.insert(userInfoSQL)
        .then(data => {
            if (!isSilence) console.log(data);
            return true; //excuted du lieu thanh cong
            }
        )
    }


    sendSMS(req){
        //lay req.json_data va gui sms
        //sms_owner.send_sms_vlr_mnp ('903500888','gui Key2','MobiFone3',5);
        return new Promise((resolve,reject)=>{
            resolve(JSON.stringify({
                status: 0,
                message: 'test key ' + req.json_data.key
            }));
        })
    }

}

module.exports = {
    service_id: config.service_key,
    handler: new HandleDatabaseService()
};