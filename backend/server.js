import express from 'express';
import cors from 'cors'
import { getCustomerInfo } from './database_api.js';
import { getAIResponse } from './ai_api.js';

const app = express();
app.use(cors());

const port = 3000;

const email = "camila.mendes@example.com";

const customerInfo = await getCustomerInfo(email);

const response = await getAIResponse(customerInfo, " Quero saber o status da minha última compra.");



// 1 - usuário + mensagem
// 2 - consultar banco de dados para pegar a info do usuário
// 3 - montar prompt de sistema
// 4 - retornar resposta da AI

app.listen(port, () => {
    console.log(`servidor ouvindo na porta ${port}`);
})