import mysql, { OkPacket, RowDataPacket } from 'mysql2/promise';

export const createConnection = async () => {
  const connection = await mysql.createConnection({
    host: 'bd1.highti.com.br',
    user: 'studiovip',
    password: 'sTuD10v1p&',
    database: 'studiovip',
    port: 3306,
  });
  return connection;
};

export const query = async <T = any>(sql: string, values: any[] = []): Promise<T[]> => {
  const connection = await createConnection();
  try {
    console.log('Executando consulta SQL:', sql, 'Com valores:', values);
    const [results] = await connection.execute<RowDataPacket[]>(sql, values);
    console.log('Resultado da consulta:', results);
    return results as T[];
  } catch (error) {
    console.error('Erro ao executar a consulta:', (error as Error).message);
    throw new Error(`Erro ao executar a consulta: ${(error as Error).message}`);
  } finally {
    await connection.end();
  }
};

// Para operações de escrita
export const execute = async (sql: string, values: any[] = []): Promise<OkPacket> => {
  const connection = await createConnection();
  try {
    console.log('Executando consulta SQL:', sql, 'Com valores:', values);
    const [result] = await connection.execute<OkPacket>(sql, values);
    console.log('Resultado da consulta:', result);
    return result as OkPacket;
  } catch (error) {
    console.error('Erro ao executar a consulta:', (error as Error).message);
    throw new Error(`Erro ao executar a consulta: ${(error as Error).message}`);
  } finally {
    await connection.end();
  }
};
