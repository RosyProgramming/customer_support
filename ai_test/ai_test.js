import { GoogleGenAI } from "@google/genai";
import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

function getDaysSincePurchase(purchase){
    const today = new Date();
    const diffInMilis = today - purchase.date;

    return Math.floor(diffInMilis / 1000 / 60 / 60 / 24);
}

function getCustomerAge(customer){
    const today = new Date();
    const diffWithBirthDate = today - customer.birth_date;

    return (new Date(diffWithBirthDate)).getFullYear() - 1970;
}

const pool = new Pool({
    connectionString: "postgresql://neondb_owner:npg_JEFo9Sk4ZBKM@ep-weathered-wind-ad059n6h-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
    ssl: {
        rejectUnauthorized: false
    }
});

const customer = (await pool.query("SELECT * FROM customers WHERE id = '5481dd9e-0f80-47e1-915c-395346312a05'")).rows[0];

const purchases = (await pool.query("SELECT * FROM purchases WHERE customer_id = '5481dd9e-0f80-47e1-915c-395346312a05'")).rows;

let purchasesString = "";

for(let purchase of purchases){
    purchasesString += `
    - ${purchase.product}:
        - Preço: ${purchase.price}
        - Status: ${purchase.status}
        - Dias desde a compra: ${getDaysSincePurchase(purchase)} 
    `
}

console.log(purchasesString);

const genai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY });

// agir como um atendente da nossa empresa de e-commerce
// responder perguntas sobre pedidos
// ele só podera responder perguntas sobre pedidos, se o cliente perguntar qualquer outra coisa
// direcionar para atnedimento humano
// inserir dados ndo banco de dados

// inserir dados do banco de dados "fake"

const systemInstruction = `
Você é um atendente de uma empresa de e-commerce. Você está conversando com clientes que
podem ter dúvidas sobre suas compras recentes no site. Responda os clientes de forma amigável.

Não informe nada a respeito de você para o cliente, diga apenas que você é um atendente virtual.

Caso o cliente pergunte sobre algo não relacionado à empresa ou aos nossos serviços, indique que
não pode ajudá-lo com isso. Caso o cliente pergunte sobre algo relacionado à empresa, mas que não
é explicitamente sobre suas compras passadas, direcione ele ao atendimento humano pelo número: (11)1234-5678.

Altere o tom das suas respostas de acordo com a idade do cliente. Se o cliente for jovem, dialogue de
forma mais informal. Se o cliente for idoso, trate-o com o devido respeito.

Se o cliente reclamar sobre o atraso nas suas compras, verifique se a compra excedeu o SLA de entrega
de acordo com a região do cliente:

NORTE: 10 dias
NORDESTE: 7 dias
SUL: 5 dias
CENTRO-OESTE: 5 dias
SUDESTE: 2 dias

Você não pode realizar nenhuma ação a não ser responder perguntas sobre os dados a seguir. Caso o
cliente necessite de alguma ação por parte da empresa (como contestar compras), direcione-o ao suporte.

<CLIENTE>
Nome: ${customer.first_name} ${customer.last_name}
email: ${customer.email}
idade: ${getCustomerAge(customer)}
estado: ${customer.state}

<COMPRAS>
${purchasesString}

`;


const response = await genai.models.generateContent({
    model: 'gemini-2.0-flash',
    config: {
        systemInstruction: systemInstruction,
    },
    contents: "olá, gostaria de saber qual foi a minha ultima compra eo valor dela?"
});

console.log(response.candidates[0].content.parts[0].text);
