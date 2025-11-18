import express from 'express';
import cors from 'cors'
import { getCustomerInfo } from './database_api.js';
import { getAIResponse } from './ai_api.js';

const app = express();
app.use(cors());
app.use(express.json());


const port = 3000;

app.post("/support", async (req, res) => {
    const email = req.body.email;
    const message = req.body.message;

    const customerInfo = await getCustomerInfo(email);
    const response = await getAIResponse(customerInfo, message);

    res.send(JSON.stringify({
        response: response
    }));
});

// const email = "camila.mendes@example.com";

// 1 - usuário + mensagem
// 2 - consultar banco de dados para pegar a info do usuário
// 3 - montar prompt de sistema
// 4 - retornar resposta da AI

app.listen(port, () => {
    console.log(`servidor ouvindo na porta ${port}`);
})