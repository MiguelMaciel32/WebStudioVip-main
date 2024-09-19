import { Storage } from '@google-cloud/storage';


export const storage = new Storage({
  projectId: 'seu-projeto-id',
  keyFilename: 'caminho/para/sua-chave.json', 
});

export const bucketName = 'seu-bucket-name';

export const bucket = storage.bucket(bucketName);
