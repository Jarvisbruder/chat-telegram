// deno-lint-ignore-file

import { Bot, session, InputFile } from "https://deno.land/x/grammy/mod.ts";
// chatmembers https://grammy.dev/plugins/chat-members.html#storing-chat-members


const bot = new Bot(Deno.env.get("BOT_TOKEN" || "")); // Deno.env.get("BOT_TOKEN") || ""



export default async (req, context) => {

    bot.use(session({ initial: () => ({ messages: 1 }) }))

    //bot.filter(ctx => ctx.chat?.type === 'private').command('start', ctx =>
    //bot.on(':new_chat_members:me', ctx =>


    // Collect statistics
    bot.on('message', async (ctx, next) => {
     if (ctx.session.messages < 3 ) {  // !!! this is not saved no a db, will get lost on refresh?
      ctx.session.messages++
      await next() // continue
    }  else {
      ctx.reply(`too many attempts`)
    }
    })

    bot.command('stats', async ctx => {
        const message = `You sent <b>${ctx.session.messages} messages</b> since I'm here!`
        await ctx.reply(message, { parse_mode: 'HTML' })
      })




bot.command("start", (ctx) => ctx.reply(`Welcome ${ctx.from?.username}!`));
/* bot.command('help', async (ctx) => {
    await ctx.reply('Here are some helpful commands you can use:');
    await ctx.reply('/start - Start the bot');
    await ctx.reply('/stats - stats');
    await ctx.reply('/help - Show this message');
  }); */


// ! works also with the command   bot.command("imagine", async (ctx) => { (just need to change the substring number to 8)


bot.on('message:text', async (ctx) => {


    if (ctx.message.text.toLowerCase().includes('imagine')) {

            // Get information about the user's role and permissions
            const chatId = ctx.chat.id;
            const userFrom = ctx.from?.username;
            const userId = ctx.from?.id
            const userMe = ctx.me?.id;

            //ctx.deleteMessage(); // Delete the user's message
            //ctx.reply(`${chatId} ${userId} ${userMe} ${userFrom} `); 

          const pyloadImg = {
            prompt: ctx.message.text.substring(7), // "imagine = 7 characters", similar to slice()
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
        
             ctx.replyWithPhoto(
            new InputFile({ url: completion.data[0].url }),
            {caption: "AI generated"}
            ) 
          

      } else {

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


                ctx.reply(`${completion.choices[0].message.content}` );   //  #Token used = ${completion.usage.total_tokens}

            } catch (error) {
                ctx.reply(error || 'Something went wrong');
            }
        }

  });




  bot.on("message:photo", (ctx) => ctx.reply("Nice photo! Is that you?"));


  // https://github.com/cyclic-software/starter-telegram-bot/blob/main/src/bot.ts

  const replyWithIntro = (ctx) =>
  ctx.reply(`Hello!`, {
    parse_mode: "HTML",
  });
  // Keep this at the bottom of the file
    bot.on("message", replyWithIntro);

  // Catch errors and log them
  bot.catch(err => console.error(err))


    bot.start();


    return new Response


  }  
  




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
  