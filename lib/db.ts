import mysql, { OkPacket, RowDataPacket, Connection } from 'mysql2/promise';

// Função para criar uma conexão com o banco de dados
export const createConnection = async (): Promise<Connection> => {
  return mysql.createConnection({
    host: 'bd1.highti.com.br',
    user: 'studiovip',
    password: 'sTuD10v1p&',
    database: 'studiovip',
    port: 3306,
  });
};

// Função para executar consultas de leitura
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

// Função para executar consultas de escrita
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

// Função para executar consultas dentro de uma transação
export const executeTransaction = async (queries: [string, any[]][]): Promise<void> => {
  const connection = await createConnection();
  try {
    await connection.beginTransaction();
    for (const [sql, values] of queries) {
      await connection.execute(sql, values);
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.error('Erro na transação, rollback realizado:', (error as Error).message);
    throw new Error(`Erro na transação: ${(error as Error).message}`);
  } finally {
    await connection.end();
  }
};
