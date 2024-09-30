
import admin from 'firebase-admin';
import serviceAccount from '../app/conifg/studiovip-6913f-firebase-adminsdk-bqy07-c74f758da7.json';


if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    storageBucket: 'studiovip-6913f.appspot.com', 
  });
}


const db = admin.firestore();
const bucket = admin.storage().bucket(); 


export { db, admin, bucket };
