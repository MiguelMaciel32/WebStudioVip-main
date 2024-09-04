import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createConnection, query } from '../../../lib/db'; // Ajuste o caminho conforme necessário

const uploadDirectory = path.join(process.cwd(), 'public', 'empresa');

export const config = {
  api: {
    bodyParser: false, // Importante para usar o formidable
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const form = new formidable.IncomingForm({
        uploadDir: uploadDirectory,
        keepExtensions: true,
      });

      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error('Erro ao fazer parse do formulário:', err);
          return res.status(500).json({ error: 'Erro ao processar o formulário.' });
        }

        const companyName = (fields.companyName as string | undefined) ?? '';
        const contactInfo = (fields.contactInfo as string | undefined) ?? '';
        const address = (fields.address as string | undefined) ?? '';
        const username = (fields.username as string | undefined) ?? '';
        const password = (fields.password as string | undefined) ?? '';

        // Verificar se `files.logo` é um array ou um único arquivo
        let logoFile = files.logo as formidable.File | formidable.Files | undefined;

        // Se for um array, pegamos o primeiro arquivo
        if (Array.isArray(logoFile)) {
          logoFile = logoFile[0];
        }

        // Se logoFile ainda for undefined, retornamos erro
        if (!logoFile || !logoFile.filepath) {
          return res.status(400).json({ error: 'Arquivo de logo é obrigatório.' });
        }

        // Garantir que logoFile.filepath é uma string antes de usá-lo
        if (typeof logoFile.filepath !== 'string') {
          return res.status(500).json({ error: 'Erro ao processar o caminho do arquivo.' });
        }

        // Verificar se todos os campos obrigatórios foram fornecidos
        if (!companyName || !contactInfo || !address || !username || !password) {
          return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
        }

        // Verificar se o usuário existe
        const userRows = await query<{ id: number }>('SELECT id FROM users WHERE username = ?', [username]);
        if (userRows.length === 0) {
          return res.status(400).json({ error: 'Usuário não encontrado.' });
        }

        const userId = userRows[0].id;

        // Construir o caminho do arquivo e salvar
        const fileName = `${Date.now()}-${logoFile.newFilename}`;
        const filePath = path.join(uploadDirectory, fileName);

        try {
          fs.renameSync(logoFile.filepath, filePath); // Mover o arquivo para o diretório final
        } catch (moveError) {
          console.error('Erro ao mover o arquivo:', moveError);
          return res.status(500).json({ error: 'Erro ao mover o arquivo.' });
        }

        // Inserir a empresa no banco de dados
        const logoUrl = `/empresa/${fileName}`;
        const result = await query(
          'INSERT INTO companies (user_id, company_name, contact_info, address, logo) VALUES (?, ?, ?, ?, ?)',
          [userId, companyName, contactInfo, address, logoUrl]
        );

        // Se `insertId` não estiver presente no resultado, retornar erro
        const insertId = (result as any).insertId;
        if (insertId === undefined) {
          return res.status(500).json({ error: 'Erro ao inserir empresa no banco de dados.' });
        }

        return res.status(200).json({ success: true, companyId: insertId });
      });
    } catch (error) {
      console.error('Erro ao cadastrar empresa:', error);
      return res.status(500).json({ error: 'Erro ao cadastrar empresa.' });
    }
  } else {
    return res.status(405).json({ error: 'Método não permitido.' });
  }
}