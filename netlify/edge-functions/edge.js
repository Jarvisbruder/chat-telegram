// deno-lint-ignore-file

import { Bot, session, InputFile } from "https://deno.land/x/grammy/mod.ts";

// https://grammy.dev/plugins/chat-members.html#storing-chat-members
// https://github.com/cyclic-software/starter-telegram-bot/blob/main/src/bot.ts


const bot = new Bot(Deno.env.get("BOT_TOKEN" || ""));


export default async (request, context) => {


// Collect statistics    
bot.use(session({ initial: () => ({ messages: 1, tokens: 100}) }))
bot.on('message', async (ctx, next) => {
    ctx.session.messages++  
    // !this is not saved no a db
    // if (ctx.session.messages === 3) {await ctx.reply('you have sent 3 messages!');}   
    await next() // continue      
})


bot.command('stats', async (ctx) => {
    const message = `You sent
    <i>${ctx.session.messages} messages</i>
    since I'm here!`
    ctx.reply(message, { parse_mode: 'HTML' }) // limited parsing, span has specific classes, no css??
  })


bot.command("start", (ctx) => ctx.reply(`Welcome ${ctx.from?.username} from ${context.geo.country.name}!`));
bot.command('help', async (ctx) => {
    await ctx.reply('Here are some helpful commands you can use:');
    await ctx.reply('/imagine + description - to generate an image'); 
    await ctx.reply('/start - Start the bot');
    await ctx.reply('/stats - stats');
    await ctx.reply('/help - Show this message');
  });

bot.command('imagine', async (ctx) => {

    try {
          const pyloadImg = {
            prompt: ctx.message.text.substring(8), // "/imagine = 8 characters", similar to slice()
            n: 1,
            size: "256x256", // "512x512" "1024x1024",
            response_format: "url", // "b64_json"
          }

          const completion = await fetch("https://api.openai.com/v1/images/generations", {
              headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY" || "")}`,
              },
              method: "POST",
              body: JSON.stringify(pyloadImg),
            }).then(res => res.json())
        
            await ctx.replyWithPhoto(
                    new InputFile({ url: completion.data[0].url }),
                    {caption: ctx.message.text.substring(8)}
                  )
            await ctx.deleteMessage(); // Delete the user's messag


      } catch (error) {
        await ctx.reply(error || 'Something went wrong');
    }
});


// ! works also with the command   bot.command("imagine", async (ctx) => { (just need to change the substring number to 8)
bot.on('message:photo', (ctx) => ctx.reply("Nice photo!"));
bot.on('message:text', async (ctx) => { 

    if (ctx.session.tokens <= 0) {
    await ctx.reply(`You have no more tokens! Buy new <a href="https://www.google.com"> here</a>`, { parse_mode: 'HTML' })  
    return
    }

      try {
            const payload = {
              model: "gpt-3.5-turbo",
              messages: [
                  {role: "system", content: `You are ChatGPT, a large language model trained by OpenAI. Answer as concisely as possible.`},
                  {role: "user", content: ctx.message.text}
                  ],
              temperature: 0.7,
              max_tokens: 1000,
              n: 1,
            };

            const completion = await fetch("https://api.openai.com/v1/chat/completions", {
                headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY" || "")}`,
                },
                method: "POST",
                body: JSON.stringify(payload),
            }).then(res => res.json())

            ctx.session.tokens = ctx.session.tokens - completion.usage.total_tokens
            ctx.reply(`${completion.choices[0].message.content} ## ${ctx.session.tokens} tokens left` );

        } catch (error) {
          await ctx.reply(error || 'Something went wrong');
      }
 
});



    bot.catch(err => console.error(err))
    bot.start();


    return new Response


  }  
  

// bot.on('message:text', async (ctx) => { if (ctx.message.text.toLowerCase().includes('imagine')) { ...
//ctx.reply(`${chatId} ${userId} ${userMe} ${userFrom} `); 
//bot.filter(ctx => ctx.chat?.type === 'private').command('start', ctx =>
//bot.on(':new_chat_members:me', ctx =>

/* // Get information about the user's role and permissions (chatmembers module)
  const chatId = ctx.chat.id;
  const userFrom = ctx.from?.username;
  const userId = ctx.from?.id
  const userMe = ctx.me?.id; */


/* const res = await context.next();
const page = await res.text();
const regex = /{ABOUT_}/i;
let cookbox = "ciao"
let updatedPage = page.replace(regex, cookbox);
return new Response(updatedPage,  res)  */



/*   // Only set up the webhook once during deployment
if (process.env.NODE_ENV === 'production') {
    bot.api.setWebhook(webhookUrl);
  }


  export default async (req, res) => {
    const update = req.body;
    await bot.handleUpdate(update);
    res.status(200).end(); */
  