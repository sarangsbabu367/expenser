import 'dotenv/config'
import { Telegraf } from "telegraf";
import axios from 'axios';
import { convertArgs } from './helper'
const url = process.env.URL || 'http://localhost:3000';

const botToken = process.env.BOT_TOKEN || '';
const bot = new Telegraf(botToken);
const message = `
Expense \n\n\n
1. Configure your API key and secret eg: /configure ajknsd ajsdiw  \n
command: /configure API_KEY API_SECRET
\n \n \n \n
2. Add Expense \n
command: /add --amount=250 --type=food --currency=$ --remark=test\n
`
bot.start((ctx) => {
    ctx.reply(message, {
        parse_mode: 'HTML'
    })
})

bot.command('/configure', async (ctx) => {
    const x = ctx.message;
    let keys = x.text.split('/configure');
    keys = keys.filter(x => x !== '');
    const API_SECRET = keys[0];
    ctx.reply('Please wait while configuring')
    try {
        if (!API_SECRET) {
            ctx.reply('Please enter API_SECRET')
        }
        else {
            const response = await axios.post(`${url}/api/v1/integrations/telegram/configure`, {
                API_SECRET,
                CHAT_ID: ctx.chat.id
            })
            ctx.reply('Configured')
        }
    } catch (error) {
        console.log(error);
        ctx.reply('Something went wrong')
    }

})



bot.command('/add', async (ctx) => {
    const x = ctx.message;
    let keys = x.text.split('/add').filter(y => y !== '');
    keys = keys[0].split(' ').filter(y => y !== '');
    const data:{
        amount?: number,
        remark?: string,
        type?: string,
        currency?: string
    } = convertArgs(keys);
    const {
        amount,
        remark,
        type,
        currency
    } = data
    if (!amount) {
        return ctx.reply('Please enter amount')
    }

    ctx.reply('Please wait while adding expense to sheet');
    try {
        if (!amount || !type) {
            ctx.reply('Please enter all the fields')
        }
        else {
            await axios.post(`${url}/api/v1/integrations/telegram/add-expense`, {
                data: {
                    amount,
                    remark,
                    type,
                    symbol: currency
                }
            }, {
                headers: {
                    'chat_id': ctx.chat.id,
                    'Content-Type': 'application/json'
                }
            })
            ctx.reply('Expense added to sheet')
        }
    } catch (error) {
        console.log(error);
        ctx.reply('Something went wrong')
    }
})

bot.launch();
console.log('bot started...!')